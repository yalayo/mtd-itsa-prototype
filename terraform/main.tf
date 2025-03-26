terraform {
  cloud {
    organization = "rondon-sarnik"

    workspaces {
      name = "mtd-app"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.1.0"
    }
  }
}

variable "cloudflare_api_token" {
  default = ""
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_workers_script" "worker" {
  account_id  = var.cloudflare_account_id
  script_name = "mtd-itsa-prototype"
  compatibility_date = "2024-01-01"
  content     = file("worker.js")
  
  # Explicitly set to module format for D1 compatibility
  module = true
  
  bindings = [{
    name = "DB"
    type = "d1"
    id = cloudflare_d1_database.db.id
  }]
  
  depends_on = [
    cloudflare_d1_database.db
  ]
}