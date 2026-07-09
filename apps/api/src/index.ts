import { Hono } from 'hono'
import { cors } from 'hono/cors'
import ocrRouter from './routes/ocr'

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

export default app