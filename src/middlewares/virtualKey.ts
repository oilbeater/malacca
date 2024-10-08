import { Context, Next } from "hono";
import { AppContext } from '.';

export const virtualKeyMiddleware = async (c: Context<AppContext>, next: Next) => {
    const apiKey = c.req.header('api-key') || '';
    const realKey = await c.env.MALACCA_USER.get(apiKey);
    if (!realKey) {
        return c.text('Unauthorized', 401);
    }
    c.set('realKey', realKey);
    await next();
};