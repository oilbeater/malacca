import { Hono, Context } from 'hono';
import { AIProvider, AIRequestParams } from '../types';
import { generateCacheKey } from '../utils/cache';
import { metricsMiddleware } from '../utils/analytics';
import { bufferMiddleware } from '../utils/buffer';
import { loggingMiddleware } from '../utils/logging';

const BasePath = '/azure-openai/:resource_name/deployments/:deployment_name';
const ProviderName = 'azure-openai';
const azureOpenAIRoute = new Hono();

azureOpenAIRoute.use(bufferMiddleware, metricsMiddleware, loggingMiddleware);

azureOpenAIRoute.post('/*', async (c: Context) => {
    c.set('endpoint', ProviderName);
    const resourceName = c.req.param('resource_name') || '';
    const deploymentName = c.req.param('deployment_name') || '';
    const functionName = c.req.path.slice(`/azure-openai/${resourceName}/deployments/${deploymentName}/`.length);

    const params: AIRequestParams = { resourceName, deploymentName, functionName };
    return azureOpenAIProvider.handleRequest(c, params);
});

export const azureOpenAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: azureOpenAIRoute,
    handleRequest: async (c: Context, params: AIRequestParams) => {
        const { resourceName, deploymentName, functionName } = params;
        const azureEndpoint = `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}/${functionName}`;
        const body = await c.req.json();

        const queryParams = new URLSearchParams(c.req.query()).toString();
        const urlWithQueryParams = `${azureEndpoint}?${queryParams}`;

        const apiKey = c.req.header('api-key');
        const realKey = await c.env.MALACCA_USER.get(apiKey);
        if (!realKey) {
            return c.text('Unauthorized', 401);
        }

        const cacheKeyHex = await generateCacheKey(urlWithQueryParams, body);
        const responseFromCache = await c.env.MALACCA_CACHE.get(cacheKeyHex, "stream");

        if (responseFromCache) {
            return new Response(responseFromCache, { headers: { 'malacca-cache-status': 'hit' } });
        }

        const headers = new Headers(c.req.header());
        headers.set('api-key', realKey);

        const response = await fetch(urlWithQueryParams, {
            method: c.req.method,
            body: JSON.stringify(body),
            headers: headers
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const reader = response.body?.getReader();
        if (!reader) {
            return c.text('Internal Server Error', 500);
        }

        let buf = '';

        (async () => {
            const decoder = new TextDecoder('utf-8');
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                await writer.write(value);
                buf += decoder.decode(value);
            }

            if (response.status === 200) {
                c.executionCtx.waitUntil(c.env.MALACCA_CACHE.put(cacheKeyHex, buf, { expirationTtl: 3600 }));
            }
            await writer.close();
        })();

        const newResponse = new Response(readable, { status: response.status, headers: response.headers });
        newResponse.headers.append('malacca-cache-status', 'miss');
        return newResponse;
    }
};
