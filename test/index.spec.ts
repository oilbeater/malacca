// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { beforeAll, describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

beforeAll(async () => {
	// Set up Cloudflare KV
	await env.MALACCA_USER.put('oilbeater', import.meta.env.VITE_AZURE_API_KEY);
});

describe('Welcome to Malacca worker', () => {
	it('responds with Welcome to Malacca! (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(await response.text()).toMatchInlineSnapshot(`"Welcome to Malacca!"`);
	});
});

describe('Test Cache', () => {
	const url = `https://example.com/azure-openai/${import.meta.env.VITE_AZURE_RESOURCE_NAME}/${import.meta.env.VITE_AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=2024-07-01-preview`;
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
            "text": "Tell me a very short story about sunwukong"
          }
        ]
      }
    ],
    "temperature": 0.7,
    "top_p": 0.95,
    "max_tokens": 800,
    "stream": ${stream}
  }`;

	it('with cache first response should with header malacca-cache-status: miss and following response with hit', async () => {
		const body = createRequestBody(false);
    let start = Date.now();
    let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const value = await response.json()
    const duration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('malacca-cache-status')).toBe('miss');

    start = Date.now();
    response = await SELF.fetch(url, {method: 'POST', body: body, headers: {'Content-Type': 'application/json', 'api-key': 'oilbeater'}});
    const cacheValue = await response.json()
    const cacheDuration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('malacca-cache-status')).toBe('hit');
    expect(value).toEqual(cacheValue)
    expect(duration/2).toBeGreaterThan(cacheDuration)
  });
  
  it('Test stream with cache', async () => { 
    const body = createRequestBody(true);
    let start = Date.now();
    let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'api-key': 'oilbeater' } });
    const value = await response.text()
    const duration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('malacca-cache-status')).toBe('miss');

    start = Date.now();
    response = await SELF.fetch(url, {method: 'POST', body: body, headers: {'Content-Type': 'application/json', 'api-key': 'oilbeater'}});
    const cacheValue = await response.text()
    const cacheDuration = Date.now() - start

    expect(response.status).toBe(200);
    expect(response.headers.get('malacca-cache-status')).toBe('hit');
    expect(value).toEqual(cacheValue)
    expect(duration/2).toBeGreaterThan(cacheDuration)
  });

});