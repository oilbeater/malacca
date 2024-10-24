# OpenAI

To leverage the advanced features provided by Malacca while using the OpenAI API, you only need to adjust the `base_url` configuration in the original SDK. This simple change allows you to benefit from Malacca's capabilities such as caching, virtual key management, rate limiting, logging and all other features.

You need to get the following parameters:

- `Worker_Domain`: The domain url where your Worker is accessible, you can find it in your worker Settings.
- `Virtual_Key`: The virtual key that protect your real API key.

## Python Example

You can use [OpenAI Python SDK](https://github.com/openai/openai-python) to visit OpenAI with Malacca endpoint.

```python
from openai import OpenAI

client = OpenAI(api_key="{Virtual_Key}", base_url="https://{Worker_Domain}/openai/")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Tell me a very short story about Malacca."},
    ],
    stream=False
)

print(response.choices[0].message.content)
```