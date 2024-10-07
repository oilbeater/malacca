# ⚡ Caching

Malacca Caching can significantly enhance the performance and efficiency of your LLM (Large Language Model) applications. Here are some key benefits:

- ⚡️ Reduced latency: By caching responses, Malacca can serve repeated queries instantly, dramatically reducing response times.
- 💰 Cost savings: Cached responses eliminate the need for redundant API calls, potentially lowering your usage costs for LLM services.
- 🔌 Offline capabilities: With caching, your application can provide responses even when the LLM API is temporarily unavailable.
- 😊 Enhanced user experience: Faster response times due to caching lead to a smoother and more responsive user experience.

By default Malacca will use the full request body as the cache key, which means only exactly same request will hit the cache.

Malacca only cache the 200 response with 3600s ttl, you can add your own logical to achieve advanced cache by modifying the code logical. 

For cached response there will be a header in the response:

```bash
malacca-cache-status: hit
```

You can customize the cache logic by modifying the cache middleware in `src/middlewares/cache.ts`.
