import { Context, MiddlewareHandler } from 'hono';

export function recordAnalytics(
  c: Context,
  endpoint: string,
  duration: number,
  prompt_tokens: number,
  completion_tokens: number
) {
  if (c.env.MALACCA) {
    const getModelName = c.get('getModelName');
    const modelName = typeof getModelName === 'function' ? getModelName(c) : 'unknown';
    c.env.MALACCA.writeDataPoint({
      'blobs': [endpoint, c.req.path, c.res.status, c.get('malacca-cache-status') || 'miss', modelName],
      'doubles': [duration, prompt_tokens, completion_tokens],
      'indexes': [endpoint],
    });
  }
}

export const metricsMiddleware: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now();

  await next();

  c.executionCtx.waitUntil((async () => {
    await c.get('bufferPromise')
    const buf = c.get('buffer')
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endpoint = c.get('endpoint') || 'unknown';
    let prompt_tokens = 0;
    let completion_tokens = 0;
    if (c.res.status === 200) {
      if (c.res.headers.get('content-type') === 'application/json') {
        const usage = JSON.parse(buf)['usage'];
        if (usage) {
          prompt_tokens = usage['prompt_tokens'] | 0;
          completion_tokens = usage['completion_tokens'] | 0;
        }
      } else {
        completion_tokens = buf.split('\n\n').length - 1;
      }
    }
    recordAnalytics(c, endpoint, duration, prompt_tokens, completion_tokens);
  })());
};









