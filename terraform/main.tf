terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  # Optional: Configure a backend for state storage
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "cloudflare" {
  # API token is configured via environment variable CLOUDFLARE_API_TOKEN
}

# Create a Cloudflare D1 database
resource "cloudflare_d1_database" "cloudaccount_db" {
  name   = "CLOUDACCOUNT_DB"
  account_id = var.cloudflare_account_id
}

# Create a worker script with the built code
resource "cloudflare_worker_script" "cloudaccount_app" {
  account_id = var.cloudflare_account_id
  name       = "cloudaccount-app"
  content    = file("${path.module}/worker.js")  # This will be built by the GitHub Actions pipeline
  
  # Bind the D1 database to the worker
  d1_database_binding {
    name         = "DB"
    database_id  = cloudflare_d1_database.cloudaccount_db.id
  }
  
  # Add other bindings as needed (KV, R2, etc.)
}

# Create a custom domain for the worker
resource "cloudflare_worker_domain" "cloudaccount_domain" {
  account_id = var.cloudflare_account_id
  hostname   = "app.${var.domain_name}"
  service    = cloudflare_worker_script.cloudaccount_app.name
  zone_id    = var.domain_zone_id
}

# Create DNS record for the domain
resource "cloudflare_record" "cloudaccount_dns" {
  zone_id = var.domain_zone_id
  name    = "app"
  value   = "100::"  # Special value for Cloudflare Workers
  type    = "AAAA"
  proxied = true
}