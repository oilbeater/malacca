import { Hono, Context, Next } from 'hono';
import { AIProvider } from '../types';
import {
    cacheMiddleware,
    metricsMiddleware,
    bufferMiddleware,
    loggingMiddleware,
    virtualKeyMiddleware,
    rateLimiterMiddleware,
    guardMiddleware
} from '../middlewares';

const BasePath = '/azure-openai/:resource_name/deployments/:deployment_name';
const ProviderName = 'azure-openai';
const azureOpenAIRoute = new Hono();

const initMiddleware = async (c: Context, next: Next) => {
    c.set('endpoint', ProviderName);
    c.set('getModelName', getModelName);
    c.set('getTokenCount', getTokenCount);
    await next();
};


azureOpenAIRoute.use(initMiddleware, metricsMiddleware, loggingMiddleware, bufferMiddleware, virtualKeyMiddleware, rateLimiterMiddleware, guardMiddleware, cacheMiddleware);

azureOpenAIRoute.post('/*', async (c: Context) => {
    return azureOpenAIProvider.handleRequest(c);
});

export const azureOpenAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: azureOpenAIRoute,
    getModelName: getModelName,
    getTokenCount: getTokenCount,
    handleRequest: async (c: Context) => {
        const resourceName = c.req.param('resource_name') || '';
        const deploymentName = c.req.param('deployment_name') || '';
        const functionName = c.req.path.slice(`/azure-openai/${resourceName}/deployments/${deploymentName}/`.length);
        const azureEndpoint = `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}/${functionName}`;
        const queryParams = new URLSearchParams(c.req.query()).toString();
        const urlWithQueryParams = `${azureEndpoint}?${queryParams}`;

        const headers = new Headers(c.req.header());
        const apiKey: string = c.get('realKey');
        if (apiKey) {
            headers.set('api-key', apiKey);
        }
        const response = await fetch(urlWithQueryParams, {
            method: c.req.method,
            body: JSON.stringify(await c.req.json()),
            headers: headers
        });

        return response;
    }
};

function getModelName(c: Context): string {
    if (c.res.status === 200) {
        const buf = c.get('buffer') || ""
        if (c.res.headers.get('content-type') === 'application/json') {
            const model = JSON.parse(buf)['model'];
            if (model) {
                return model
            }
        } else {
            const chunks = buf.split('\n\n');
            for (const chunk of chunks) {
                if (chunk.startsWith('data: ')) {
                    const jsonStr = chunk.slice(6);
                    try {
                        const jsonData = JSON.parse(jsonStr);
                        if (jsonData.model != "") {
                            return jsonData.model;
                        }
                    } catch {
                        continue;
                    }
                }
            }
        }
    }
    return "unknown"
}

function getTokenCount(c: Context): { input_tokens: number, output_tokens: number } {
    const buf = c.get('buffer') || ""
    if (c.res.status === 200) {
        if (c.res.headers.get('content-type') === 'application/json') {
            const usage = JSON.parse(buf)['usage'];
            if (usage) {
                const input_tokens = usage['prompt_tokens'] || 0;
                const output_tokens = usage['completion_tokens'] || 0;
                return { input_tokens, output_tokens }
            }
        } else {
            // For streaming response, azure openai does not return usage in the response body, so we count the words and multiply by 4/3 to get the number of input tokens
            const requestBody = c.get('reqBuffer') || '{}'
            const messages = JSON.stringify(JSON.parse(requestBody).messages);
            const input_tokens = Math.ceil(messages.split(/\s+/).length * 4 / 3);

            // For streaming responses, we count the number of '\n\n' as the number of output tokens
            const output_tokens = buf.split('\n\n').length - 1;
            return { input_tokens: input_tokens, output_tokens: output_tokens }
        }
    }
    return { input_tokens: 0, output_tokens: 0 }
}