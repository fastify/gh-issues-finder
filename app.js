'use strict'

const fastify = require('fastify')

const { fetchIssues: defaultFetchIssues, getGithubClient: defaultGetGithubClient } = require('./fetchIssues')
const { createCache } = require('async-cache-dedupe')

function build (opts) {
  const app = fastify(opts)
  const cache = createCache({
    ttl: 5 * 60, // 5 minutes
    stale: 60,
    storage: { type: 'memory' }
  })

  const {
    fetchIssues,
    getGithubClient
  } = {
    fetchIssues: defaultFetchIssues,
    getGithubClient: defaultGetGithubClient,
    ...opts
  }

  app.register(require('@fastify/cors'), {})

  cache.define('fetchIssues', async ({ includeBody, labels, org }) => {
    return await fetchIssues(includeBody, labels, org, getGithubClient())
  })

  app.route({
    method: 'GET',
    url: '/api/find-issues',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          org: { type: 'string' },
          labels: { type: 'array' },
          includeBody: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            results: { type: 'array' }
          }
        }
      }
    },
    handler: async function (request) {
      request.log.info('issues requested')
      let { org, labels, includeBody } = request.query

      if (!org) {
        org = 'fastify'
      }

      if (!labels || !labels.length) {
        labels = ['help wanted', 'good first issue']
      }

      includeBody = includeBody === 'true'

      const issues = await cache.fetchIssues({
        includeBody,
        labels,
        org
      })

      return { results: issues }
    }
  })
  return app
}

module.exports = build
