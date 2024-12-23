import { build } from './app.js'

const server = await build({
  logger: true
})

server.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 })
