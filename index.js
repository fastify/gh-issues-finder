'use strict'

require('dotenv').config()

const fastify = require('fastify')({
  //http2: true,
  logger: true
})
const logger = require('pino')()

const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
  auth: process.env.GH_AUTH_TOKEN
})

fastify.register(require('fastify-cors'), {
  methods: ['GET']
})

const fetchIssues = async (includeBody, labels, org) => {
  const itemSearchResults = await Promise.all(
    labels.map(async label => {
      const issues = await octokit.search.issuesAndPullRequests({
        q: `is:issue is:open sort:updated-desc label:"${label}" org:"${org}"`
      })

      return issues.data.items
    })
  )
  const items = itemSearchResults.flat()

  const dedupeMap = new Map()
  for (let item of items) {
    // eslint-disable-next-line no-unused-vars
    const [_, orgMatch, repoNameMatch] = item.repository_url.match(
      /https:\/\/api\.github\.com\/repos\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/
    )
    dedupeMap.set(item.html_url, {
      url: item.html_url,
      title: item.title,
      comments: item.comments,
      body: includeBody ? item.body : undefined,
      author: {
        name: item.user.login,
        avatar_url: item.user.avatar_url,
        acc_url: item.user.html_url
      },
      project: {
        org: orgMatch,
        name: repoNameMatch,
        url: `https://github.com/${orgMatch}/${repoNameMatch}`
      },
      locked: item.locked,
      state: item.state,
      created_at: item.created_at,
      updated_at: item.updated_at,
      labels: item.labels.map(({ name }) => name)
    })
  }
  return Array.from(dedupeMap.values())
}

fastify.route({
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
    logger.info('issues requested')
    let { org, labels, includeBody } = request.query

    if (!org) {
      org = 'fastify'
    }

    if (!labels || !labels.length) {
      labels = ['help wanted', 'good first issue']
    }

    includeBody = includeBody === 'true'

    const issues = await fetchIssues(includeBody, labels, org)

    reply.send({ issues })
  }
})

fastify.listen(process.env.PORT || 3000, '0.0.0.0')
