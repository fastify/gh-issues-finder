# gh-issues-finder

[![Continuous Integration](https://github.com/fastify/gh-issues-finder/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/fastify/gh-issues-finder/actions/workflows/ci.yml)
[![CD](https://github.com/fastify/gh-issues-finder/actions/workflows/cd.yml/badge.svg?event=push)](https://github.com/fastify/gh-issues-finder/actions/workflows/cd.yml)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)


Tool to help find issues that you can contribute to

Thanks to [@GlenTiki](https://github.com/GlenTiki) for the original at https://github.com/GlenTiki/gh-issue-finder

# Usage

The main usage of this is to fetch issues in the fastify GitHub org tagged as a "good first issue" so that they can be displayed on the website for anyone looking to get started.

An example with all query params: `/api/find-issues?org=test&includeBody=true&labels=test1&labels=test2`

If not specified, `org` defaults to `fastify`, includeBody (whether the description of the issues is included or not in the response) to `false`, and labels to `['help wanted', 'good first issue']`.

Example response:

```json
{
  "issues": [
    {
      "url": "https://github.com/fastify/help/issues/658",
      "title": "How to handle canceled requests?",
      "comments": 11,
      "author": {
        "name": "danechitoaie",
        "avatar_url": "https://avatars.githubusercontent.com/u/10779010?v=4",
        "acc_url": "https://github.com/danechitoaie"
      },
      "project": {
        "org": "fastify",
        "name": "help",
        "url": "https://github.com/fastify/help"
      },
      "locked": false,
      "state": "open",
      "created_at": "2022-04-05T14:02:44Z",
      "updated_at": "2022-05-10T15:16:58Z",
      "labels": ["help wanted"]
    },
    {
      "url": "https://github.com/fastify/help/issues/667",
      "title": "Can I pass the user_ID from fastify-auth to the handler?",
      "comments": 0,
      "author": {
        "name": "ghost",
        "avatar_url": "https://avatars.githubusercontent.com/u/10137?v=4",
        "acc_url": "https://github.com/ghost"
      },
      "project": {
        "org": "fastify",
        "name": "help",
        "url": "https://github.com/fastify/help"
      },
      "locked": false,
      "state": "open",
      "created_at": "2022-04-19T01:03:14Z",
      "updated_at": "2022-04-19T01:03:14Z",
      "labels": ["help wanted"]
    }
  ]
}
```

## How to deploy

- Prerequisites: a GCP project with the [cloud run and cloud build APIs enabled](https://cloud.google.com/apis/docs/getting-started)

1. Create a service account in the IAM & Admin console to be used to deploy the app
2. Create a key for the service account, this key will be configured as a secret in the GitHub actions to be able to deploy the app
3. For the service account, [grant the permissions "Service Account User", "Cloud Run Admin", "Storage Admin"](https://github.com/google-github-actions/deploy-cloudrun) and "Cloud Build Service Account", this last permission is necessary since cloud build will be used to build the image based on the source code directly
4. Clone this repo to your GitHub account
5. Create a [Github Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `repo: public_repo` scope. Copy this token for use in the next step.
6. In the `Settings` of your GitHub repo, go to `Secrets` and create the `New repository secret` with the names and values below:
   - `GCP_PROJECT_ID`: The [ID](https://support.google.com/googleapi/answer/7014113?hl=en) of the GCP project as found in your GCP Account
   - `GCP_CLOUDRUN_SERVICE_NAME`: The name of the cloud run service, you can select any name that you prefer
   - `GCP_CLOUDRUN_SERVICE_REGION`: The [region](https://cloud.google.com/compute/docs/regions-zones) in the GCP that you want to create the cloud run service
   - `GCP_SA_KEY`: The key that you created for your service account with the permissions to deploy the app. This is a JSON object and should be used as-is
   - `GH_AUTH_TOKEN`: The Github Personal Access Token created in the last step.

After the steps above have been completed, go to `Actions` in your GitHub repo and run the CD workflow located in `.git/workflows/cd.yml`. The file is already configured with the action to deploy the cloud run service using the secrets that were created.

Once the workflow has run, go to your GCP account and open the "Cloud Run" page to see the details of the deployed service.
