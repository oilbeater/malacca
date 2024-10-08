import { Context, Next } from "hono";
import { AppContext } from '.';

export const rateLimiterMiddleware = async (c: Context<AppContext>, next: Next) => {
    const key = c.req.header('api-key') || '';
    const { success } = await c.env.MY_RATE_LIMITER.limit({ key: key })
    if (!success) {
      return new Response(`429 Failure – rate limit exceeded`, { status: 429 })
    }

    await next();
};