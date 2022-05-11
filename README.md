[![Continuous Integration](https://github.com/nearform/gh-issues-finder/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/nearform/gh-issues-finder/actions/workflows/ci.yml)
[![CD](https://github.com/nearform/gh-issues-finder/actions/workflows/cd.yml/badge.svg?event=push)](https://github.com/nearform/gh-issues-finder/actions/workflows/cd.yml)

# gh-issues-finder
Tool to help find issues that you can contribute to

Thanks to @GlenTiki for the original at https://github.com/GlenTiki/gh-issue-finder

## How to deploy

- Prerequisites: a GCP project with the [cloud run, cloud build, identity and access management (iam), cloud resource manager, iam service account credentials and security token service apis enabled](https://cloud.google.com/apis/docs/getting-started)
- Create a service account in the IAM & Admin console to be used to deploy the app
- For the service account, [grant the permissions "Cloud Build Editor", "Artifact Registry Admin", "Storage Admin", "Cloud Run Admin" and "Service Account User"](https://github.com/google-github-actions/deploy-cloudrun) and "Cloud Build Service Account", this last permission is necessary since cloud build will be used to build the image based in the source code directly
- To authenticate we're using OIDC. Create a [workload identity federation for GitHub Actions](https://cloud.google.com/iam/docs/configuring-workload-identity-federation#github-actions)
- Clone this repo to your GitHub account
- In the `Settings` of your GitHub repo, go to `Secrets` and create the `New repository secret` with the names and values below:
    - `GCP_PROJECT_ID`: The [ID](https://support.google.com/googleapi/answer/7014113?hl=en) of the GCP project as found in your GCP Account
    - `GCP_REGION`: The [region](https://cloud.google.com/compute/docs/regions-zones) in the GCP that you want to create the cloud run service
    - `GCP_RUN_SERVICE_NAME`: The name of the cloud run service, you can select any name that you prefer
    - `GCP_WORKLOAD_IDENTITY_PROVIDER`: The full identifier of the Workload Identity Provider, including the project number, pool name, and provider name. If provided, this must be the full identifier which includes all parts.
    - `GCP_SERVICE_ACCOUNT`: Email address or unique identifier of the Google Cloud service account for which to generate credentials.

- After the steps above are configured, go to `Actions` in your GitHub repo and run the CD workflow that is created in the folder `.git/workflows/cd.yaml`. The file is already configured with the action to deploy the cloud run service using the secrets that were created.
- Once the workflow run, go to you GCP Account and open the "Cloud Run" page to see the details of the deployed service.

## How to deploy

- Prerequisites: a GCP project with the [cloud run and cloud build apis enabled](https://cloud.google.com/apis/docs/getting-started)
- Create a service account in the IAM & Admin console to be used to deploy the app
- Create a key for the service account, this key will be configured as a secret in the GitHub actions to be able to deploy the app
- For the service account, [grant the permissions "Service Account User", "Cloud Run Admin", "Storage Admin"](https://github.com/google-github-actions/deploy-cloudrun) and "Cloud Build Service Account", this last permission is necessary since cloud build will be used to build the image based in the source code directly
- Clone this repo to your GitHub account
- In the `Settings` of your GitHub repo, go to `Secrets` and create the `New repository secret` with the names and values below:
    - `GCP_PROJECT_ID`: The [ID](https://support.google.com/googleapi/answer/7014113?hl=en) of the GCP project as found in your GCP Account
    - `GCP_CLOUDRUN_SERVICE_NAME`: The name of the cloud run service, you can select any name that you prefer
    - `GCP_CLOUDRUN_SERVICE_REGION`: The [region](https://cloud.google.com/compute/docs/regions-zones) in the GCP that you want to create the cloud run service
    - `GCP_SA_KEY`: The key that you created for your service account with the permissions to deploy the app. This is a JSON object and should be used as-is.
- After the steps above are configured, go to `Actions` in your GitHub repo and run the CD workflow that is created in the folder `.git/workflows/cd.yaml`. The file is already configured with the action to deploy the cloud run service using the secrets that were created.
- Once the workflow run, go to you GCP Account and open the "Cloud Run" page to see the details of the deployed service.
