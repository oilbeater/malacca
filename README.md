![Malacca Logo](./docs/malacca.jpg)

**Malacca** is an open-source AI gateway designed to become the central hub in the world of AI.

It is fully **CloudFlare Native**: allowing for global scale deployment without any maintenance overhead and free for 1M requests each day.

It is written in **TypeScript**: ensuring adaptability to the rapidly evolving AI ecosystem and catering to the diverse needs of application developers.

> Malacca is still an early-stage project, containing many experiments by the author. Currently, it only supports AzureOpenAI. We welcome contributions and ideas from the community to help expand and improve this project.

## Features

- 🌍 **Global Scale, Zero Maintenance**
  - Built on Cloudflare Workers, Malacca offers seamless global deployment without the need to manage servers.
  
- 🧩 **High Flexibility and Extensibility**
  - Written in TypeScript, which provides excellent readability and allows easy customization and expansion of features.
  
- 🛠️ **Comprehensive Feature Set**
  - 🔑 **Virtual Key**: Manage access permissions using virtual keys, providing more granular control over API access.
  - ⚡ **Caching**: Reduce latency and costs by caching repeat requests.
  - 📊 **Token Usage Monitoring**: Track the usage of tokens in real time, allowing you to understand and manage API costs.
  - 📋 **Logging**: Record requests and responses to further fine-tune or reinforcement learning.
  - 🚦 **Rate Limiting**: Protect upstream API resources by controlling request rates.

## Quick Start

### Prerequisites

- A **Cloudflare** account.
- **Wrangler CLI** installed (used to manage Cloudflare Workers).

### Deployment Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/oilbeater/malacca.git
   cd malacca
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure the Project**

   Create KV Namespace for LLM Cache and Virtual Key
   
   ```bash
   npx wrangler kv namespace create MALACCA_CACHE
   npx wrangler kv namespace create MALACCA_USER
   ```

   Then edit the `wrangler.toml` configuration with the KV ids generated.

4. **Deploy to Cloudflare Workers**

   ```bash
   npm run deploy
   ```

   Then you can visit Malacca with the Worker domain or custom domain.

## Customization and Extension

Malacca offers a flexible architecture, allowing users to:

- Add custom middleware to suit specific needs.
- Extend or modify existing features.
- Integrate additional upstream AI API services.

You can just clone and modify the code then `wrangler deploy` to deploy your code globally.

## Contact

If you have any questions or suggestions, feel free to reach out via email at [mengxin@alauda.io](mailto:mengxin@alauda.io).
