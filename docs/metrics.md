# 📊 Metrics

Malacca use [Cloudflare Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) to manage metrics like token usage, errors, latency, cache hit rate and so on.

You can query the analytics engine with [SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/) to get the metrics to draw your own dashboard.

```SQL
SELECT
     blob1 AS endpoint, 
     blob2 as path, 
     blob3 as status, 
     double1 as latency, 
     double2 as prompt_tokens, 
     double3 as completion_tokens 
FROM MALACCA 
WHERE timestamp > NOW() - INTERVAL '30' MINUTE
```

Response:

```json
{
  "meta": [
    {
      "name": "endpoint",
      "type": "String"
    },
    {
      "name": "path",
      "type": "String"
    },
    {
      "name": "status",
      "type": "String"
    },
    {
      "name": "latency",
      "type": "Float64"
    },
    {
      "name": "prompt_tokens",
      "type": "Float64"
    },
    {
      "name": "completion_tokens",
      "type": "Float64"
    }
  ],
  "data": [
    {
      "endpoint": "azure-openai",
      "path": "/azure-openai/malacca/deployments/gpt4o/chat/completions",
      "status": "404",
      "latency": 0,
      "prompt_tokens": 16,
      "completion_tokens": 703
    }
  ],
  "rows": 1,
  "rows_before_limit_at_least": 1
}
```