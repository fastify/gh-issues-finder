import { build } from './app.mjs'

const server = await build({
  logger: true
})

server.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 })
