'use strict'

const { Octokit } = require('@octokit/rest')

/* c8 ignore start */
const getGithubClient = () => {
  return new Octokit({
    auth: process.env.GH_AUTH_TOKEN
  })
}
/* c8 ignore stop */

const fetchIssues = async (includeBody, labels, org, client) => {
  const itemSearchResults = await Promise.all(
    labels.map(async label => {
      const issues = await client.search.issuesAndPullRequests({
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
      /https:\/\/api\.github\.com\/repos\/([a-zA-Z0-9\-_]+)\/(\.?[a-zA-Z0-9\-_]+)/
    )
    dedupeMap.set(item.html_url, {
      url: item.html_url,
      title: item.title,
      comments: item.comments,
      body: includeBody ? item.body : undefined,
      author: {
        name: item.user?.login,
        avatar_url: item.user?.avatar_url,
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

module.exports = { fetchIssues, getGithubClient }
