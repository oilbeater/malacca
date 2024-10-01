import { Context, Hono } from 'hono';

export interface Bindings {
    MALACCA: AnalyticsEngineDataset,
    MALACCA_USER: KVNamespace,
    MALACCA_CACHE: KVNamespace,
}

export interface AIProvider {
    name: string;
    handleRequest: (c: Context) => Promise<Response>;
    basePath: string;
    route: Hono;
}
