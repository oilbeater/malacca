import { Context, Next } from "hono";
import { AppContext, setMiddlewares } from '.';

export const virtualKeyMiddleware = async (c: Context<AppContext>, next: Next) => {
    setMiddlewares(c, 'virtualKey');
    const apiKey = c.get('getVirtualKey')(c);
    const realKey = await c.env.MALACCA_USER.get(apiKey);
    if (!realKey) {
        return c.text('Unauthorized', 401);
    }
    c.set('realKey', realKey);
    await next();
};