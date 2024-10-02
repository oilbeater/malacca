import { Context, Next } from 'hono';

export const loggingMiddleware = async (c: Context, next: Next) => {
    await next();

    // Log request and response
    c.executionCtx.waitUntil((async () => {
        const requestBody = c.get('reqBuffer') || '';
        console.log('Request:', {
            body: requestBody,
        });

        await c.get('bufferPromise')
        console.log('Response:', {
            body: c.get('buffer'),
        });
    })());
};
