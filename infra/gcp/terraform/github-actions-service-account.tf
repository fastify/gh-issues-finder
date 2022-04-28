resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "github-actions"
}

resource "google_service_account_key" "github_actions" {
  service_account_id = google_service_account.github_actions.name
}

resource "google_secret_manager_secret" "github_actions_sa" {
  provider = google-beta

  secret_id = "github-actions-service-account"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "github_actions_sa" {
  provider = google-beta

  secret = google_secret_manager_secret.github_actions_sa.id

  secret_data = google_service_account_key.github_actions.private_key
}

resource "google_secret_manager_secret" "github_actions_sa_email" {
  provider = google-beta

  secret_id = "github-actions-service-account-email"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "github_actions_sa_email" {
  provider = google-beta

  secret = google_secret_manager_secret.github_actions_sa_email.id

  secret_data = google_service_account.github_actions.email
}

resource "google_artifact_registry_repository_iam_member" "github_actions_ar" {
  provider = google-beta

  location = var.region
  repository = google_artifact_registry_repository.main.name
  role   = "roles/artifactregistry.writer"
  member = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_cloud_run_service_iam_member" "github_actions_backend" {
  location = google_cloud_run_service.backend.location
  service = google_cloud_run_service.backend.name
  role = "roles/run.admin"
  member = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_service_account_user" {
  project = var.gcp_project_id
  role    = "roles/iam.serviceAccountUser"
  member = "serviceAccount:${google_service_account.github_actions.email}"
}