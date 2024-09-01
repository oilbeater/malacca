import { Hono, Context } from 'hono'

const app = new Hono()
const azureOpenAI = new Hono()

app.use(async (c, next) => {
  const start = Date.now()
  await next()

  console.log(c.res.status)
  const stream = c.res.body as ReadableStream
  for await (const chunk of stream) {
    console.log(chunk.toString())
  }

  const end = Date.now()
  console.log(`${end - start}`)
})

azureOpenAI.post('/*', handleChat)
app.get('/', (c) => c.text('Welcome to Malacca!'))
app.route('/azure-openai/:resource_name/:deployment_name', azureOpenAI).onError((err, c) => c.text(err.message, 500))

async function handleChat(c: Context) {
  const resourceName = c.req.param('resource_name')
  const deploymentName = c.req.param('deployment_name')
  const functionName = c.req.path.slice(`/azure-openai/${resourceName}/${deploymentName}/`.length)

  const azureEndpoint = `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}/${functionName}`
  const body = await c.req.json()
  const apiKey = c.req.header('api-key')
  if (!apiKey) {
    return c.text('api-key header is required', 401)
  }

  const queryParams = new URLSearchParams(c.req.query()).toString()
  const urlWithQueryParams = `${azureEndpoint}?${queryParams}`
  const response = await fetch(urlWithQueryParams, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    }
  })
  return response
}

export default app