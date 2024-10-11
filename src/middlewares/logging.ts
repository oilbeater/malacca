import { Context, Next } from 'hono';
import { AppContext, setMiddlewares } from '.';

export const loggingMiddleware = async (c: Context<AppContext>, next: Next) => {
    setMiddlewares(c, 'logging');
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
