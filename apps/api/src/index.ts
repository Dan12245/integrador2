import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    status: 'success', 
    message: 'Ouyea Hono API is working',
    timestamp: new Date().toISOString()
  })
})

export default app