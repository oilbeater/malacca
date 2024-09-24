import { Context } from 'hono';

export interface Bindings {
    MALACCA: AnalyticsEngineDataset,
    MALACCA_USER: KVNamespace,
    MALACCA_CACHE: KVNamespace,
}

export interface AIRequestParams {
    resourceName: string;
    deploymentName: string;
    functionName: string;
}

export interface AIProvider {
    name: string;
    handleRequest: (c: Context, params: AIRequestParams) => Promise<Response>;
    basePath: string;
    route: any;
}
