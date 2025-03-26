variable "cloudflare_api_token" {
  description = "Cloudflare API token with Workers and D1 permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
}

variable "neon_database_url" {
  description = "Neon PostgreSQL connection string"
  type        = string
  sensitive   = true
}