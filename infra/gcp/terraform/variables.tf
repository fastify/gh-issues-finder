variable "gcp_project_id" {
    default= "gh-issues-finder"
    description = "The GCP project id"
    type = string
}

variable "region" {
    default= "europe-west1"
    description = "GCP region"
    type = string
}

variable "zone" {
    default = "europe-west1-a"
    description = "GCP zone"
    type      = string
}

variable "github_token" {
    description = "The Github token with access to interact with API"
    type      = string 
    sensitive = true
}

variable "artifact_registry_repository_name" {
    description = "The GCP artifact registry repository name"
    type      = string
}
