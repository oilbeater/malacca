import { Hono, Context } from 'hono';
import { AIProvider, AIRequestParams } from '../types';
import { cacheMiddleware } from '../middlewares/cache';
import { metricsMiddleware } from '../middlewares/analytics';
import { bufferMiddleware } from '../middlewares/buffer';
import { loggingMiddleware } from '../middlewares/logging';

const BasePath = '/azure-openai/:resource_name/deployments/:deployment_name';
const ProviderName = 'azure-openai';
const azureOpenAIRoute = new Hono();

azureOpenAIRoute.use(bufferMiddleware, metricsMiddleware, loggingMiddleware, cacheMiddleware);

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

        const headers = new Headers(c.req.header());
        headers.set('api-key', realKey);

        const response = await fetch(urlWithQueryParams, {
            method: c.req.method,
            body: JSON.stringify(body),
            headers: headers
        });

        return response;
    }
};
