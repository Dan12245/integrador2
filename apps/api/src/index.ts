import { Hono } from 'hono'
import { cors } from 'hono/cors'
import ocrRouter from './routes/ocr'
import routerBuilding from './routes/rutaEdificios'
import chatRouter from './routes/chat'

const app = new Hono()
app.use('/*', cors())

app.get('/', (c) => {
  return c.json({ 
    status: 'success', 
    message: 'Ouyea Hono API is working',
    timestamp: new Date().toISOString()
  })
})

app.route('/', ocrRouter)
//nomas añadimos una nueva wea, en este caso para añadir edificios
app.route('/',routerBuilding)

export default app