import { Context, MiddlewareHandler, Next } from "hono";
import { AppContext } from './index';

export async function generateCacheKey(urlWithQueryParams: string, body: string): Promise<string> {
  const cacheKey = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(urlWithQueryParams + JSON.stringify(body))
  );
  return Array.from(new Uint8Array(cacheKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const cacheMiddleware: MiddlewareHandler = async (c: Context<AppContext>, next: Next) => {
  const cacheKeyHex = await generateCacheKey(c.req.url, await c.req.text());
  const response = await c.env.MALACCA_CACHE.get(cacheKeyHex, "stream");
  if (response) {
    const { _, metadata } = await c.env.MALACCA_CACHE.getWithMetadata(cacheKeyHex, "stream");
    const contentType = metadata['contentType'] || 'application/octet-stream';
    c.set('malacca-cache-status', 'hit');
    console.log(contentType);
    return new Response(response, { headers: { 'malacca-cache-status': 'hit', 'content-type': contentType } });
  }

  await next();

  if (c.res.status === 200) {
    c.executionCtx.waitUntil((async () => {
      await c.get('bufferPromise');
      const contentType = c.res.headers.get('content-type');
      c.executionCtx.waitUntil(c.env.MALACCA_CACHE.put(cacheKeyHex, c.get('buffer'), { expirationTtl: 3600, metadata: { 'contentType': contentType } }));
    })());
  }
};