# Virtual Key

Virtual Key is a security feature that allows you to protect your real API key by providing a separate, temporary key for authentication. This feature enhances the security of your API usage in several ways:

- 🎭 Masking: It hides your actual API key, reducing the risk of exposure.
- 🔐 Access Control: You can create and manage multiple virtual keys with different permissions.
- ❌ Revocation: Virtual keys can be easily revoked without affecting the main API key.
- 📊 Usage Tracking: Each virtual key's usage can be monitored separately.

> Virtual Key is enabled by default, so you need at least set up one key before invoke API calls.

## How to set Virtual Key

Virtual Key is implemented by Cloudflare Worker KV, you can easily add a delete key by Wrangler CLI.

1. Add a Virtual Key
   
   ```bash
   VIRTUAL_KEY=malacca
   REAL_KEY=YOUR_REAL_API_KEY
   npx wrangler kv key put ${VIRTUAL_KEY} ${REAL_KEY} --binding MALACCA_USER
   ```

2. Revoke a Virtual Key

    ```bash
    npx wrangler kv key delete malacca --binding MALACCA_USER
    ```

You can also manage the KV pairs directly from Cloudflare Worker KV web console.