# 🔄 Fallback

Malacca's fallback is designed to protect your API from upstream API failures. When the upstream API fails, Malacca will automatically fallback to the CF Workers AI. By default it will fallback to the `@cf/meta/llama-3.1-8b-instruct` model.

You can customize the fallback logical to fit your needs or change to another model by modifying the `src/middlewares/fallback.ts` file.

