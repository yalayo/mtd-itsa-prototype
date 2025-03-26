terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  
  backend "remote" {
    organization = "cloudaccount"
    
    workspaces {
      name = "cloudaccount-prod"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_worker_script" "cloudaccount_app" {
  name    = "cloudaccount-app"
  content = file("${path.module}/worker.js")

  # KV Namespace binding
  kv_namespace_binding {
    name         = "SESSIONS"
    namespace_id = cloudflare_workers_kv_namespace.sessions.id
  }

  # D1 Database binding
  d1_database_binding {
    name          = "DB"
    database_name = cloudflare_d1_database.cloudaccount_db.name
    database_id   = cloudflare_d1_database.cloudaccount_db.id
  }

  # Secret environment variables
  secret_text_binding {
    name = "DATABASE_URL"
    text = var.neon_database_url
  }
}

resource "cloudflare_workers_kv_namespace" "sessions" {
  title = "cloudaccount-sessions"
}

resource "cloudflare_d1_database" "cloudaccount_db" {
  name = "cloudaccount-database"
}

resource "cloudflare_worker_domain" "cloudaccount_domain" {
  hostname = "app.cloudaccount.uk"
  zone_id  = var.cloudflare_zone_id
  service  = cloudflare_worker_script.cloudaccount_app.name
}

resource "cloudflare_record" "cloudaccount_dns" {
  zone_id = var.cloudflare_zone_id
  name    = "app"
  value   = "192.0.2.1" # Placeholder IP, actual resolution handled by Cloudflare
  type    = "A"
  proxied = true
}

# Run migrations against D1 database
resource "null_resource" "run_migrations" {
  depends_on = [cloudflare_d1_database.cloudaccount_db]

  provisioner "local-exec" {
    command = "npx wrangler d1 execute cloudaccount-database --file=migrations/0000_initial_schema.sql && npx wrangler d1 execute cloudaccount-database --file=migrations/0001_sample_data.sql"
  }
}