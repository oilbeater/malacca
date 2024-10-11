import { Context, MiddlewareHandler, Next } from "hono";
import { AppContext, setMiddlewares } from ".";

const denyRequestPatterns = [
    'password',
];

const denyResponsePatterns = [
    'password',
];


// The guard middleware is used to protect the API by checking if the request match the specific regex. 
// If so it returns message "Rejected due to inappropriate content" with 403 status code.
export const guardMiddleware: MiddlewareHandler = async (c: Context<AppContext>, next: Next) => {
    setMiddlewares(c, 'guard');
    const requestText = await c.req.text();
    if (denyRequestPatterns.some(pattern => new RegExp(pattern, 'i').test(requestText))) {
        return c.text('Rejected due to inappropriate content', 403);
    }
    
    await next();

    if (c.res.status === 200 && c.res.headers.get('Content-Type')?.includes('application/json')) {
        const responseText = await c.res.clone().text();
        if (denyResponsePatterns.some(pattern => new RegExp(pattern, 'i').test(responseText))) {
            return c.text('Rejected due to inappropriate content', 403);
        }
    }
}