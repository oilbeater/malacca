export async function generateCacheKey(urlWithQueryParams: string, body: any): Promise<string> {
  const cacheKey = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(urlWithQueryParams + JSON.stringify(body))
  );
  return Array.from(new Uint8Array(cacheKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
