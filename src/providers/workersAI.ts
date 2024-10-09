import { Context, Hono } from 'hono';
import { AIProvider } from '../types';

const ProviderName = 'workers-ai';
const BasePath = '/workers-ai';
const workersAIRoute = new Hono();
workersAIRoute.post('/:provider/:repo/:model', async (c) => {
    return workersAIProvider.handleRequest(c);
});

export const workersAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: workersAIRoute,
    getModelName: getModelName,
    getTokenCount: getTokenCount,
    handleRequest: async (c: Context<{ Bindings: Env }>) => {
        const provider = c.req.param('provider');
        const repo = c.req.param('repo');
        const model = c.req.param('model')
        const response = await c.env.AI.run(`${provider}/${repo}/${model}`,
            await c.req.json());

        if (response instanceof ReadableStream) {
            return new Response(response);
        }

        return new Response(JSON.stringify(response));
    }
};

function getModelName(c: Context) {
    return "workers-ai";
}

function getTokenCount(c: Context) {
    return { input_tokens: 0, output_tokens: 0 };
}
