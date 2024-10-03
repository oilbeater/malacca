import { Context, MiddlewareHandler, Next } from 'hono';
import { AppContext } from '.';

export function recordAnalytics(
  c: Context<AppContext>,
  endpoint: string,
  duration: number,
) {

  const getModelName = c.get('getModelName');
  const modelName = typeof getModelName === 'function' ? getModelName(c) : 'unknown';

  const getTokenCount = c.get('getTokenCount');
  const { input_tokens, output_tokens } = typeof getTokenCount === 'function' ? getTokenCount(c) : { input_tokens: 0, output_tokens: 0 };

  // console.log(endpoint, c.req.path, modelName, input_tokens, output_tokens, c.get('malacca-cache-status') || 'miss', c.res.status);

  if (c.env.MALACCA) {
    c.env.MALACCA.writeDataPoint({
      'blobs': [endpoint, c.req.path, c.res.status.toString(), c.get('malacca-cache-status') || 'miss', modelName],
      'doubles': [duration, input_tokens, output_tokens],
      'indexes': [endpoint],
    });
  }
}

export const metricsMiddleware: MiddlewareHandler = async (c: Context<AppContext>, next: Next) => {
  const startTime = Date.now();
  await next();

  c.executionCtx.waitUntil((async () => {
    await c.get('bufferPromise');
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endpoint = c.get('endpoint') || 'unknown';
    recordAnalytics(c, endpoint, duration);
  })());
};









