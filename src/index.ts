import { Hono } from 'hono';
import { providers } from './providers';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Welcome to Malacca!'));

Object.entries(providers).forEach(([_, provider]) => {
  app.route(provider.basePath, provider.route);
});

app.onError((err, c) => c.text(err.message, 500));

export default app;