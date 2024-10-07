import { Context, Next } from 'hono';
import { AppContext } from '.';

export const fallbackMiddleware = async (c: Context<AppContext>, next: Next) => {
    try {
        await next();

        // Check if the response status is in the 5xx range
        if (c.res && c.res.status >= 500 && c.res.status < 600) {
            throw new Error(`Upstream returned ${c.res.status} status`);
        }
    } catch (error) {
        try {
            // Call CF Workers AI as a fallback
            const fallbackResponse = await c.env.AI.run(
                "@cf/meta/llama-3.1-8b-instruct",
                await c.req.json()
            );

            let response: Response;
            if (fallbackResponse instanceof ReadableStream) {
                response = new Response(fallbackResponse);
            } else {
                response = new Response(fallbackResponse.response);
            }

            // Add a header to indicate fallback was used
            response.headers.set('X-Fallback-Used', 'true');
            return response;
        } catch (fallbackError) {
            return new Response('Both primary and fallback providers failed', { status: 500 });
        }
    }
};
