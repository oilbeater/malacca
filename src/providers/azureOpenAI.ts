import { Hono, Context, Next } from 'hono';
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

const initMiddleware = async (c: Context, next: Next) => {
    c.set('endpoint', ProviderName);
    c.set('getModelName', getModelName);
    await next();
};


azureOpenAIRoute.use(initMiddleware, metricsMiddleware, loggingMiddleware, bufferMiddleware, virtualKeyMiddleware, cacheMiddleware);

azureOpenAIRoute.post('/*', async (c: Context) => {
    return azureOpenAIProvider.handleRequest(c);
});

export const azureOpenAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: azureOpenAIRoute,
    getModelName: getModelName,
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
                    } catch (error) {
                    }
                }
            }
        }
    }
    return ""
}