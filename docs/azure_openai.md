# Azure OpenAI Usage

To leverage the advanced features provided by Malacca while using the Azure OpenAI API, you only need to adjust the `base_url` configuration in their SDK. This simple change allows you to benefit from Malacca's capabilities such as caching, virtual key management, rate limiting, and logging.

You need to get the following parameters:

- `Worker_Domain`: The domain url where your Worker is accessible, you can find it in your worker Settings.
- `Resource_Name`: The Azure OpenAI resource name.
- `Deployment_Name`: The Azure OpenAI deployment name.
- `Virtual_Key`: The virtual key that protect your real API key.

## Python Example

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key="{Virtual_Key}",
    base_url="https://{Worker_Domain}/azure-openai/{Resource_Name}",
    api_version="2024-07-01-preview"
)

completion = client.chat.completions.create(
    model="{Deployment_Name}",
    messages=[
        {
            "role": "user",
            "content": "Tell me a very short story about Malacca.",
        },
    ],
)

print(completion.to_json())
```

## Curl Example

```bash
curl --request POST \
  --url 'https://${Worker_Domain}/azure-openai/${Resource_Name}/deployments/${Deployment_Name}/chat/completions?api-version=2024-07-01-preview' \
  --header 'Content-Type: application/json' \
  --header 'api-key: ${Virtual_Key}' \
  --header 'content-type: application/json' \
  --data '{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Tell a very short story about Malacca"
        }
      ]
    }
  ],
  "model": "",
  "temperature": 0.7,
  "top_p": 0.95,
  "max_tokens": 800,
  "stream": false
}'
```