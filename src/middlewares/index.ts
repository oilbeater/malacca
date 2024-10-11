import { Context } from 'hono';

export { cacheMiddleware } from './cache';
export { metricsMiddleware } from './analytics';
export { bufferMiddleware } from './buffer';
export { loggingMiddleware } from './logging';
export { virtualKeyMiddleware } from './virtualKey';
export { rateLimiterMiddleware } from './rateLimiter';
export { guardMiddleware } from './guard';
export { fallbackMiddleware } from './fallback';
export interface AppContext {
    Bindings: Env,
    Variables: {
        middlewares: string[],
        endpoint: string,
        'malacca-cache-status': string,
        bufferPromise: Promise<any>,
        buffer: string,
        reqBuffer: string,
        realKey: string,
        getModelName: (c: Context) => string,
        getTokenCount: (c: Context) => { input_tokens: number, output_tokens: number },
        getVirtualKey: (c: Context) => string,
    }
}

export function setMiddlewares(c: Context, name: string) {
    if (!c.get('middlewares')) {
        c.set('middlewares', [name]);
    } else {
        c.set('middlewares', [...c.get('middlewares'), name]);
    }
}