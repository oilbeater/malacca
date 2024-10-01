import { Hono, Context } from 'hono';
import { AIProvider } from '../types';
import {
    cacheMiddleware,
    metricsMiddleware,
    bufferMiddleware,
    loggingMiddleware,
    virtualKeyMiddleware
} from '../middlewares';

const BasePath = '/azure-openai/:resource_name/deployments/:deployment_name';
const ProviderName = 'azure-openai';
const azureOpenAIRoute = new Hono();

azureOpenAIRoute.use(bufferMiddleware, metricsMiddleware, loggingMiddleware, virtualKeyMiddleware, cacheMiddleware);

azureOpenAIRoute.post('/*', async (c: Context) => {
    c.set('endpoint', ProviderName);
    return azureOpenAIProvider.handleRequest(c);
});

export const azureOpenAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: azureOpenAIRoute,
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
