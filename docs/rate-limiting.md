# 🚦 Rate Limiting

Rate Rate limiting is a crucial feature that helps protect your application from potential abuse or unintended overuse. By implementing rate limits, you can:

- 🛡️ Prevent excessive requests from a single user or IP address
- 💰 Control costs by limiting the number of API calls
- 🚀 Ensure fair usage and maintain service quality for all users
- 🔒 Mitigate potential Denial of Service (DoS) attacks

Malacca's rate limiting feature relies on the [Cloudflare Workers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) feature. It allows you to set limits on the number of requests a user can make within a specified time frame. 

By default it limit by the virtual key and allows 100 requests per minute.

You can modify the limit tokens count in `wrangler.toml` file, for example:

```toml
[[unsafe.bindings]]
name = "MY_RATE_LIMITER"
type = "ratelimit"
namespace_id = "1001"
simple = { limit = 100, period = 60 }
```

And uou can also modify the rate limiting logic by modifying the rate limiting middleware in `src/middlewares/rateLimiter.ts`.