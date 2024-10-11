/// <reference types="vite/client" />
/// <reference path="../worker-configuration.d.ts" />
import { env, SELF } from 'cloudflare:test';
import { beforeAll, describe, it, expect } from 'vitest';

declare module "cloudflare:test" {
    interface ProvidedEnv extends Env { }
}

beforeAll(async () => {
    await env.MALACCA_USER.put('deepseek', import.meta.env.VITE_DEEPSEEK_API_KEY);
});

const url = `https://example.com/deepseek/chat/completions`;

const createRequestBody = (stream: boolean, placeholder: string) => `
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content":  "You are an AI assistant that helps people find information."
    },
    {
      "role": "user",
      "content":  "Tell me a very short story about ${placeholder}"
    }
  ],
  "temperature": 0.7,
  "top_p": 0.95,
  "max_tokens": 100,
  "stream": ${stream}
}`;

describe('Test Virtual Key', () => {
    it('should return 401 for invalid api key', async () => {
        const response = await SELF.fetch(url, {
            method: 'POST',
            body: createRequestBody(true, 'Malacca'),
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer invalid-key' }
        });

        expect(response.status).toBe(401);
    });
});

describe('Test Guard', () => {
    it('should return 403 for deny request', async () => {
        const response = await SELF.fetch(url, {
            method: 'POST',
            body: createRequestBody(true, 'password'),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` }
        });

        expect(response.status).toBe(403);
    });
});

describe('Test Cache', () => {
    it('with cache first response should with no header malacca-cache-status and following response with hit', async () => {
      const body = createRequestBody(false, 'Malacca');
      let start = Date.now();
      let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` } });
      const value = await response.json()
      const duration = Date.now() - start
  
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('malacca-cache-status')).toBeNull();
  
      start = Date.now();
      response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` } });
      const cacheValue = await response.json()
      const cacheDuration = Date.now() - start
  
      expect(response.status).toBe(200);
      expect(response.headers.get('malacca-cache-status')).toBe('hit');
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(value).toEqual(cacheValue)
      expect(duration / 2).toBeGreaterThan(cacheDuration)
    });
  
    it('Test stream with cache', async () => {
      const body = createRequestBody(true, 'Malacca');
      let start = Date.now();
      let response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` } });
      const value = await response.text()
      const duration = Date.now() - start
  
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/event-stream');
      expect(response.headers.get('malacca-cache-status')).toBeNull();
  
      start = Date.now();
      response = await SELF.fetch(url, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` } });
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` }
      });
  
      expect(response.status).not.toBe(200);
      expect(response.headers.get('malacca-cache-status')).toBeNull();
  
      // Second request with the same invalid body
      response = await SELF.fetch(url, {
        method: 'POST',
        body: invalidBody,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer deepseek` }
      });
  
      expect(response.status).not.toBe(200);
      // Should still be a cache miss, as non-200 responses are not cached
      expect(response.headers.get('malacca-cache-status')).toBeNull();
    });
  });