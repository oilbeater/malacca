import { Hono } from 'hono';
import { providers } from './providers';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => c.text('Welcome to Malacca!'));

Object.entries(providers).forEach(([_, provider]) => {
  app.route(provider.basePath, provider.route);
});

app.onError((err, c) => c.text(err.message, 500));

export default app;