resource "google_service_account" "gh_issues_finder" {
  account_id   = "gh-issues-finder"
  display_name = "gh-issues-finder"
}

resource "google_secret_manager_secret_iam_member" "github_token" {
  secret_id = google_secret_manager_secret.github_token.secret_id
  role = "roles/secretmanager.secretAccessor"
  member = "serviceAccount:${google_service_account.gh_issues_finder.email}"
}

resource "google_cloud_run_service_iam_member" "backend_noauth" {
  location = google_cloud_run_service.backend.location
  service  = google_cloud_run_service.backend.name
  role = "roles/run.invoker"
  member = "allUsers"
}

resource "google_cloud_run_service" "backend" {
  name     = "gh-issues-finder-backend"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.gh_issues_finder.email
      containers {
        image = "gcr.io/cloudrun/hello"
        ports {
          container_port = "8080"
        }
        env {
          name  = "API_HOST"
          value = "0.0.0.0"
        }
        env {
          name  = "API_PORT"
          value = "8080"
        }
        env {
          name  = "SECRETS_STRATEGY"
          value = "gcp"
        }
        env {
          name  = "JWT_SECRET"
          value = "1234abcd"
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name  = "AUTH0_DOMAIN"
          value = "dummy"
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "1000"
        "run.googleapis.com/client-name"        = "cloud-console"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  autogenerate_revision_name = true

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
      template[0].metadata[0].annotations
    ]
  }
}
