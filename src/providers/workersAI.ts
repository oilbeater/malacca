import { Context, Hono } from 'hono';
import { AIProvider } from '../types';

const ProviderName = 'workers-ai';
const BasePath = '/workers-ai';
const workersAIRoute = new Hono();
workersAIRoute.all('/*', async (c) => {
    return workersAIProvider.handleRequest(c);
});

export const workersAIProvider: AIProvider = {
    name: ProviderName,
    basePath: BasePath,
    route: workersAIRoute,
    getModelName: getModelName,
    getTokenCount: getTokenCount,
    handleRequest: async (c: Context<{ Bindings: Env }>) => {
        const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct",
            await c.req.json());
      
          return new Response(JSON.stringify(response));
    }
};

function getModelName(c: Context) {
    return "workers-ai";
}

function getTokenCount(c: Context) {
    return { input_tokens: 0, output_tokens: 0 };
}
    