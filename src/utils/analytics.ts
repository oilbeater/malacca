import { Context, MiddlewareHandler } from 'hono';

export function recordAnalytics(
  c: Context,
  endpoint: string,
  duration: number,
  prompt_tokens: number,
  completion_tokens: number
) {
  if (c.env.MALACCA) {
    c.env.MALACCA.writeDataPoint({
      'blobs': [endpoint, c.req.path, c.res.status],
      'doubles': [duration, prompt_tokens, completion_tokens],
      'indexes': ['azure'],
    });
  }
}

export const timingMiddleware: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();

  await next();
  
  c.executionCtx.waitUntil((async () => {
    await c.get('bufferPromise')
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Request duration: ${duration}ms`);
  })());
};









