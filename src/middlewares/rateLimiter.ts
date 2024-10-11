import { Context, Next } from "hono";
import { AppContext, setMiddlewares } from '.';

export const rateLimiterMiddleware = async (c: Context<AppContext>, next: Next) => {
    setMiddlewares(c, 'rateLimiter');
    const key = c.req.header('api-key') || '';
    const { success } = await c.env.MY_RATE_LIMITER.limit({ key: key })
    if (!success) {
      return new Response(`429 Failure – rate limit exceeded`, { status: 429 })
    }

    await next();
};