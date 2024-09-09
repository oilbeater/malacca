import { Hono, Context } from 'hono'

type Bindings = {
  MALACCA: AnalyticsEngineDataset,
}
const app = new Hono<{ Bindings: Bindings }>()
const azureOpenAI = new Hono()

azureOpenAI.use(async (c: Context, next) => {
  const start = Date.now()
  await next()
  const end = Date.now()

  c.env.MALACCA.writeDataPoint({
    'blobs': [c.get('endpoint'), c.req.path, c.res.status],
    'doubles': [end-start],
    'indexes': ['azure'],
  })

})

azureOpenAI.post('/*', handleChat)
app.get('/', (c) => c.text('Welcome to Malacca!'))
app.route('/azure-openai/:resource_name/:deployment_name', azureOpenAI).onError((err, c) => c.text(err.message, 500))

async function handleChat(c: Context) {
  c.set("endpoint", "azure-openai")
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

  console.log(response.headers)
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
      console.log(decoder.decode(value));
      await writer.write(value);
    }
    await writer.close();
  })();

  return new Response(readable, response);
}

export default app