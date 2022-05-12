'use strict'

const server = require('./app')({
  logger: true
})

server.listen(process.env.PORT || 3000, '0.0.0.0')
