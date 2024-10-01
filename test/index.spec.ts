/// <reference types="vite/client" />
/// <reference path="../worker-configuration.d.ts" />
import { env, SELF } from 'cloudflare:test';
import { beforeAll, describe, it, expect } from 'vitest';

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env { }
}

beforeAll(async () => {
  // Set up Cloudflare KV
  await env.MALACCA_USER.put('oilbeater', import.meta.env.VITE_AZURE_API_KEY, { metadata: { 'contentType': 'application/json' } });
});

describe('Welcome to Malacca worker', () => {
  it('responds with Welcome to Malacca! (integration style)', async () => {
    const response = await SELF.fetch('https://example.com');
    expect(await response.text()).toMatchInlineSnapshot(`"Welcome to Malacca!"`);
  });
});

const url = `https://example.com/azure-openai/${import.meta.env.VITE_AZURE_RESOURCE_NAME}/deployments/${import.meta.env.VITE_AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=2024-07-01-preview`;
const createRequestBody = (stream: boolean) => `
{
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are an AI assistant that helps people find information."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Tell me a very short story about Malacca"
        }
      ]
    }
  ],
  "temperature": 0.7,
  "top_p": 0.95,
  "max_tokens": 800,
  "stream": ${stream}
}`;

describe('Test Cache', () => {
  it('with cache first response should with no header malacca-cache-status and following response with hit', async () => {
    const body = createRequestBody(false);
    let start = Date.now();
    let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const value = await response.json()
    const duration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('malacca-cache-status')).toBeNull();

    start = Date.now();
    response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const cacheValue = await response.json()
    const cacheDuration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('malacca-cache-status')).toBe('hit');
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(value).toEqual(cacheValue)
    expect(duration / 2).toBeGreaterThan(cacheDuration)
  });

  it('Test stream with cache', async () => {
    const body = createRequestBody(true);
    let start = Date.now();
    let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const value = await response.text()
    const duration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('malacca-cache-status')).toBeNull();

    start = Date.now();
    response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const cacheValue = await response.text()
    const cacheDuration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('malacca-cache-status')).toBe('hit');
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(value).toEqual(cacheValue)
    expect(duration / 2).toBeGreaterThan(cacheDuration)
  });

  it('should not cache non-200 responses', async () => {
    const invalidBody = JSON.stringify({
      messages: [{ role: "user", content: "This is an invalid request" }],
      stream: "invalid-model",
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 800,
    });

    // First request - should return a non-200 response
    let response = await SELF.fetch(url, {
      method: 'POST',
      body: invalidBody,
      headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' }
    });

    expect(response.status).not.toBe(200);
    expect(response.headers.get('malacca-cache-status')).toBeNull();

    // Second request with the same invalid body
    response = await SELF.fetch(url, {
      method: 'POST',
      body: invalidBody,
      headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' }
    });

    expect(response.status).not.toBe(200);
    // Should still be a cache miss, as non-200 responses are not cached
    expect(response.headers.get('malacca-cache-status')).toBeNull();
  });
});

describe('Test Virtual Key', () => {
  it('should return 401 for invalid api key', async () => {
    const response = await SELF.fetch(url, {
      method: 'POST',
      body: createRequestBody(true),
      headers: { 'Content-Type': 'application/json', 'api-key': 'invalid-key' }
    });

    expect(response.status).toBe(401);
  });
});
