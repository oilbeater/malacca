import { Context, Next } from "hono";

export async function generateCacheKey(urlWithQueryParams: string, body: any): Promise<string> {
  const cacheKey = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(urlWithQueryParams + JSON.stringify(body))
  );
  return Array.from(new Uint8Array(cacheKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const cacheMiddleware = async (c: Context, next: Next) => {
  const cacheKeyHex = await generateCacheKey(c.req.url, await c.req.text());
  const responseFromCache = await c.env.MALACCA_CACHE.get(cacheKeyHex, "stream");

  if (responseFromCache) {
    return new Response(responseFromCache, { headers: { 'malacca-cache-status': 'hit' } });
  }

  await next();

  if (c.res.status === 200) {
    c.executionCtx.waitUntil((async () => {
      await c.get('bufferPromise');
      c.executionCtx.waitUntil(c.env.MALACCA_CACHE.put(cacheKeyHex, c.get('buffer'), { expirationTtl: 3600 }));
    })());
  }
};