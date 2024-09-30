# Logging

Malacca can record all the API request and response body for further fine-tune or reinforcement learning.

It is built on the Cloudflare worker logging mechanism you can view streaming log through the [Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/) or [Logpuh](https://developers.cloudflare.com/workers/observability/logs/logpush/)  to a destination.

The log entry looks like this:

```json
{
  "truncated": false,
  "outcome": "ok",
  "scriptVersion": {
    "id": "4d9d8c51-8b2e-4396-8e6f-e328fa14f80e"
  },
  "scriptName": "malacca",
  "diagnosticsChannelEvents": [],
  "exceptions": [],
  "logs": [
    {
      "message": [
        {
          "request_body": {
            "messages": [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "Tell me a short story about Malacca"
                  }
                ]
              }
            ],
            "model": "",
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 800,
            "stream": false
          }
        }
      ],
      "level": "log",
      "timestamp": 1727689534756
    },
    {
      "message": [
        {
          "response_body": "{\"choices\":[{\"content_filter_results\":{\"hate\":{\"filtered\":false,\"severity\":\"safe\"},\"protected_material_code\":{\"filtered\":false,\"detected\":false},\"protected_material_text\":{\"filtered\":false,\"detected\":false},\"self_harm\":{\"filtered\":false,\"severity\":\"safe\"},\"sexual\":{\"filtered\":false,\"severity\":\"safe\"},\"violence\":{\"filtered\":false,\"severity\":\"safe\"}},\"finish_reason\":\"stop\",\"index\":0,\"logprobs\":null,\"message\":{\"content\":\"Once upon a time in the historical port city of Malacca, there stood an ancient lighthouse on a hill, overlooking the Straits of Malacca. This lighthouse, known as the Light of Malacca, had guided sailors safely to shore for centuries.\\n\\nOne fateful evening, a fierce storm rolled in from the sea. Dark clouds swirled, and thunder roared as if the heavens themselves were at war. The waves crashed violently against the rocky shore, and the people of Malacca huddled in their homes, praying for safety.\\n\\nAmidst the chaos, young Aisha, the lighthouse keeper's daughter, noticed that the light in the lighthouse had gone out. The storm had knocked out the flames. Without the beacon, ships at sea would be lost to the treacherous waters.\\n\\nWith her father away on an urgent errand, Aisha knew she had to act quickly. Braving the howling winds and torrential rain, she climbed the steep hill to the lighthouse. Her heart pounded with each step, but her resolve never wavered.\\n\\nReaching the top, she battled the elements to relight the flame. She struck match after match, her hands trembling from the cold and wet. Finally, the wick caught fire, and the lighthouse blazed back to life. Its powerful beam cut through the storm, guiding the ships safely to harbor.\\n\\nThe next morning, as the storm subsided and the sun rose over the horizon, the townspeople gathered to thank Aisha. Her bravery had saved countless lives. From that day forward, the Light of Malacca was known not just as a beacon for sailors, but as a symbol of courage and hope, embodied by a young girl who dared to shine in the darkest of times.\",\"role\":\"assistant\"}}],\"created\":1727689535,\"id\":\"chatcmpl-AD7GBCrVx9zkg7j5r0auuLkQYjbk6\",\"model\":\"gpt-4o-2024-05-13\",\"object\":\"chat.completion\",\"prompt_filter_results\":[{\"prompt_index\":0,\"content_filter_results\":{\"hate\":{\"filtered\":false,\"severity\":\"safe\"},\"jailbreak\":{\"filtered\":false,\"detected\":false},\"self_harm\":{\"filtered\":false,\"severity\":\"safe\"},\"sexual\":{\"filtered\":false,\"severity\":\"safe\"},\"violence\":{\"filtered\":false,\"severity\":\"safe\"}}}],\"system_fingerprint\":\"fp_80a1bad4c7\",\"usage\":{\"completion_tokens\":354,\"prompt_tokens\":15,\"total_tokens\":369}}\n"
        }
      ],
      "level": "log",
      "timestamp": 1727689541328
    }
  ],
  "eventTimestamp": 1727689534741,
  "event": {
    "request": {
      "url": "http://malacca.oilbeater.com/azure-openai/malacca/deployments/gpt4o/chat/completions?api-version=2024-07-01-preview",
      "method": "POST",
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip",
        "api-key": "REDACTED",
        "cf-connecting-ip": "106.39.34.146",
        "cf-ipcountry": "CN",
        "cf-ray": "8cb347e7f97794b7",
        "cf-visitor": "{\"scheme\":\"http\"}",
        "connection": "Keep-Alive",
        "content-length": "177",
        "content-type": "application/json",
        "host": "malacca.oilbeater.com",
        "request-start-time": "1727689533645",
        "user-agent": "axios/1.7.2",
        "x-forwarded-proto": "http",
        "x-real-ip": "106.39.34.146"
      },
      "cf": {
        "clientTcpRtt": 144,
        "longitude": "116.39500",
        "latitude": "39.91100",
        "tlsCipher": "",
        "continent": "AS",
        "asn": 4847,
        "clientAcceptEncoding": "gzip, compress, deflate, br",
        "country": "CN",
        "tlsClientAuth": {
          "certIssuerDNLegacy": "",
          "certIssuerSKI": "",
          "certSubjectDNRFC2253": "",
          "certSubjectDNLegacy": "",
          "certFingerprintSHA256": "",
          "certNotBefore": "",
          "certSKI": "",
          "certSerial": "",
          "certIssuerDN": "",
          "certVerified": "NONE",
          "certNotAfter": "",
          "certSubjectDN": "",
          "certPresented": "0",
          "certRevoked": "0",
          "certIssuerSerial": "",
          "certIssuerDNRFC2253": "",
          "certFingerprintSHA1": ""
        },
        "verifiedBotCategory": "",
        "tlsVersion": "",
        "colo": "LHR",
        "timezone": "Asia/Shanghai",
        "tlsClientHelloLength": "",
        "edgeRequestKeepAliveStatus": 1,
        "requestPriority": "",
        "tlsClientExtensionsSha1": "",
        "region": "Beijing",
        "city": "Beijing",
        "regionCode": "BJ",
        "asOrganization": "China Telecom",
        "tlsClientRandom": "",
        "httpProtocol": "HTTP/1.1"
      }
    },
    "response": {
      "status": 200
    }
  },
  "id": 0
}
```