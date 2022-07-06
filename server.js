'use strict'

const server = require('./app')({
  logger: true
})

server.listen({ host: '0.0.0.0', port: process.env.PORT || 3000 })
