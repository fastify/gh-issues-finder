'use strict'

const { test } = require('node:test')
const { fetchIssues } = require('./fetchIssues')

const mockIssue = {
  url: 'https://api.github.com/repos/fastify/help/issues/478',
  labels_url:
    'https://api.github.com/repos/fastify/help/issues/478/labels{/name}',
  comments_url: 'https://api.github.com/repos/fastify/help/issues/478/comments',
  events_url: 'https://api.github.com/repos/fastify/help/issues/478/events',
  id: 933476766,
  node_id: 'MDU6SXNzdWU5MzM0NzY3NjY=',
  number: 478,
  title: 'Full text search with mongoDB',
  user: {
    login: 'Dubask',
    id: 30698018,
    node_id: 'MDQ6VXNlcjMwNjk4MDE4',
    avatar_url: 'https://avatars.githubusercontent.com/u/30698018?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/Dubask',
    html_url: 'https://github.com/Dubask',
    followers_url: 'https://api.github.com/users/Dubask/followers',
    following_url: 'https://api.github.com/users/Dubask/following{/other_user}',
    gists_url: 'https://api.github.com/users/Dubask/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/Dubask/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/Dubask/subscriptions',
    organizations_url: 'https://api.github.com/users/Dubask/orgs',
    repos_url: 'https://api.github.com/users/Dubask/repos',
    events_url: 'https://api.github.com/users/Dubask/events{/privacy}',
    received_events_url: 'https://api.github.com/users/Dubask/received_events',
    type: 'User',
    site_admin: false
  },
  labels: [{ name: 'testLabel' }],
  state: 'open',
  locked: false,
  assignee: null,
  assignees: [],
  milestone: null,
  comments: 3,
  created_at: '2021-06-30T09:12:31Z',
  updated_at: '2021-06-30T13:17:56Z',
  closed_at: null,
  author_association: 'NONE',
  active_lock_reason: null,
  body: 'test_body',
  reactions: {
    url: 'https://api.github.com/repos/fastify/help/issues/478/reactions',
    total_count: 0,
    '+1': 0,
    '-1': 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0
  },
  timeline_url: 'https://api.github.com/repos/fastify/help/issues/478/timeline',
  performed_via_github_app: null,
  score: 1
}

const mockIssue1 = {
  ...mockIssue,
  repository_url: 'https://api.github.com/repos/fastify/test1',
  html_url: 'https://github.com/fastify/help/issues/478'
}

// app was falling over because of incorrectly parsing this url previously
const mockIssue2 = {
  ...mockIssue,
  html_url: 'https://github.com/fastify/help/issues/4781',
  repository_url: 'https://api.github.com/repos/fastify/.test2'
}

const mockIssuesData = {
  total_count: 40,
  incomplete_results: false
}

const mockSearchIssuesAndPullRequests = {
  status: 200
}

test('tests the "/api/find-issues" route', async t => {
  let i = 0

  function searchIssuesStub () {
    switch (i++) {
      case 0:
      case 2:
        return {
          ...mockSearchIssuesAndPullRequests,
          data: { ...mockIssuesData, items: [mockIssue1] }
        }
      case 1:
      case 3:
        return {
          ...mockSearchIssuesAndPullRequests,
          data: { ...mockIssuesData, items: [mockIssue2] }
        }
      default:
        throw new Error('Unexpected call to searchIssuesStub')
    }
  }

  const build = require('./app')
  const app = build({
    fetchIssues,
    getGithubClient: () => {
      return {
        search: { issuesAndPullRequests: () => searchIssuesStub() }
      }
    }
  })

  // test with defaults
  const response = await app.inject({
    method: 'GET',
    url: '/api/find-issues'
  })

  const expectedResponseBody = {
    results: [
      {
        url: 'https://github.com/fastify/help/issues/478',
        title: 'Full text search with mongoDB',
        comments: 3,
        author: {
          name: 'Dubask',
          avatar_url: 'https://avatars.githubusercontent.com/u/30698018?v=4',
          acc_url: 'https://github.com/Dubask'
        },
        project: {
          org: 'fastify',
          name: 'test1',
          url: 'https://github.com/fastify/test1'
        },
        locked: false,
        state: 'open',
        created_at: '2021-06-30T09:12:31Z',
        updated_at: '2021-06-30T13:17:56Z',
        labels: ['testLabel']
      },
      {
        url: 'https://github.com/fastify/help/issues/4781',
        title: 'Full text search with mongoDB',
        comments: 3,
        author: {
          name: 'Dubask',
          avatar_url: 'https://avatars.githubusercontent.com/u/30698018?v=4',
          acc_url: 'https://github.com/Dubask'
        },
        project: {
          org: 'fastify',
          name: '.test2',
          url: 'https://github.com/fastify/.test2'
        },
        locked: false,
        state: 'open',
        created_at: '2021-06-30T09:12:31Z',
        updated_at: '2021-06-30T13:17:56Z',
        labels: ['testLabel']
      }
    ]
  }
  t.assert.strictEqual(response.statusCode, 200, 'returns a status code of 200')
  t.assert.strictEqual(response.body, JSON.stringify(expectedResponseBody))

  expectedResponseBody.results[0].body = mockIssue.body
  expectedResponseBody.results[1].body = mockIssue.body

  // test with specifying query params
  const response2 = await app.inject({
    method: 'GET',
    url: '/api/find-issues?org=test&includeBody=true&labels=1&labels=2'
  })

  t.assert.strictEqual(response2.statusCode, 200, 'returns a status code of 200')
  t.assert.deepStrictEqual(JSON.parse(response2.body).results[0].body, mockIssue.body)
  t.assert.deepStrictEqual(JSON.parse(response2.body).results[1].body, mockIssue.body)
})
