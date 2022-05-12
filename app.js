'use strict'

const fastify = require('fastify')

const { fetchIssues, getGithubClient } = require('./fetchIssues')

function build(opts = {}) {
  const app = fastify(opts)

  app.route({
    method: 'GET',
    url: '/api/find-issues',
    schema: {
      querystring: {
        org: { type: 'string' },
        labels: { type: 'array' },
        includeBody: { type: 'string' }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            issues: { type: 'array' }
          }
        }
      }
    },
    handler: async function (request, reply) {
      request.log.info('issues requested')
      let { org, labels, includeBody } = request.query

      if (!org) {
        org = 'fastify'
      }

      if (!labels || !labels.length) {
        labels = ['help wanted', 'good first issue']
      }

      includeBody = includeBody === 'true'

      const issues = await fetchIssues(
        includeBody,
        labels,
        org,
        getGithubClient()
      )

      reply.send({ issues })
    }
  })
  return app
}

module.exports = build
