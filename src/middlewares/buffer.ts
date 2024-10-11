import { Context, MiddlewareHandler, Next } from 'hono'
import { AppContext, setMiddlewares } from '.';

export const bufferMiddleware: MiddlewareHandler = async (c: Context<AppContext>, next: Next) => {
  setMiddlewares(c, 'buffer');
  let buffer = ''
  let resolveBuffer!: () => void
  const bufferPromise = new Promise<void>((resolve) => {
    resolveBuffer = resolve
  })
  c.set('bufferPromise', bufferPromise)

  const reqBuffer: string = await c.req.text() || ''
  c.set('reqBuffer', reqBuffer)
  
  await next()

  const originalResponse = c.res
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  c.executionCtx.waitUntil((async () => {
    const reader = originalResponse.body?.getReader();
    if (!reader) {
      c.set('buffer', buffer);
      resolveBuffer();
      return;
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder('utf-8').decode(value)
        buffer += chunk
        await writer.write(value);
      }
    } finally {
      c.set('buffer', buffer);
      resolveBuffer();
      await writer.close();
    }
  })());

  c.res = new Response(readable, {
    status: originalResponse.status,
    statusText: originalResponse.statusText,
    headers: originalResponse.headers
  });

}
