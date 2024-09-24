import { Context } from 'hono';

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
