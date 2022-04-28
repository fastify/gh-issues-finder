resource "google_secret_manager_secret" "github_token" {
  provider = google-beta

  secret_id = "github-token"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "github_token" {
  provider = google-beta

  secret = google_secret_manager_secret.github_token.id

  secret_data = var.github_token
}