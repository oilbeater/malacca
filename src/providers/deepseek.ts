import { Hono, Context, Next } from 'hono';
import { AIProvider } from '../types';
import {
    cacheMiddleware,
    metricsMiddleware,
    bufferMiddleware,
    loggingMiddleware,
    virtualKeyMiddleware,
    rateLimiterMiddleware,
    guardMiddleware,
    fallbackMiddleware
} from '../middlewares';

const BasePath = '/deepseek';
const ProviderName = 'deepseek';
const deepseekRoute = new Hono();

const initMiddleware = async (c: Context, next: Next) => {
    c.set('endpoint', ProviderName);
    c.set('getModelName', getModelName);
    c.set('getTokenCount', getTokenCount);
    await next();
};

deepseekRoute.post('/*', async (c: Context) => {
    return deepseekProvider.handleRequest(c);
});

deepseekRoute.get('/*', async (c: Context) => {
    return c.text('DeepSeek endpoint on Malacca.', 200, { 'Content-Type': 'text/plain' });
});

export const deepseekProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: deepseekRoute,
    getModelName: getModelName,
    getTokenCount: getTokenCount,
    handleRequest: async (c: Context) => {
        const functionName = c.req.path.slice(`/deepseek/`.length);
        const deepseekEndpoint = `https://api.deepseek.com/${functionName}`;
        console.log(`DeepSeek endpoint: ${deepseekEndpoint}`);

        const response = await fetch(deepseekEndpoint, {
            method: c.req.method,
            body: JSON.stringify(await c.req.json()),
            headers: c.req.header()
        });

        return response;
    }
};

function getModelName(c: Context): string {
    const model = c.req.param('model');
    return model || "unknown";
}

function getTokenCount(c: Context): { input_tokens: number, output_tokens: number } {
    const buf = c.get('buffer') || "";
    if (c.res.status === 200) {
        try {
            const jsonResponse = JSON.parse(buf);
            const usage = jsonResponse.usage;
            if (usage) {
                return {
                    input_tokens: usage.prompt_tokens || 0,
                    output_tokens: usage.completion_tokens || 0
                };
            }
        } catch (error) {
            console.error("Error parsing response:", error);
        }
    }
    return { input_tokens: 0, output_tokens: 0 };
}
