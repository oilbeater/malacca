import { Hono, Context } from 'hono'

const app = new Hono()
const azureOpenAI = new Hono()

app.use(async (c, next) => {
  const start = Date.now()
  await next()

  console.log(c.res.status)
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

  const queryParams = new URLSearchParams(c.req.query()).toString()
  const urlWithQueryParams = `${azureEndpoint}?${queryParams}`
  const response = await fetch(urlWithQueryParams, {
    method: c.req.method,
    body: JSON.stringify(body),
    headers: c.req.header()
  })

  if (response.headers.get('transfer-encoding') === 'chunked') {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body?.getReader();
    if (!reader) {
      return c.text('Internal Server Error', 500)
    }
    const decoder = new TextDecoder('utf-8');
    (async () => {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }
        await writer.write(value);
        console.log(decoder.decode(value));
      }
      await writer.close();
    })();

    const res = new Response(readable, { ...response });
    console.log(('return res'))
    return res
  }
  return response
}

export default app