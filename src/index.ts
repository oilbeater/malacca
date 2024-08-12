import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Welcome to Malacca!'))

app.post('/v1/chat/completions', (c) => c.text('post completions'))

export default app