import { Hono, Context} from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Welcome to Malacca!'))

app.post('/v1/chat/completions', (c) => handleChat(c)).onError((err, c) => c.text('Error'))

async function handleChat(c: Context) {
  const body = await c.req.json()

  const response = await fetch(c.env['endpoint'], {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'api-key': c.env['apiKey'],
    }
  })
  return response
}

export default app