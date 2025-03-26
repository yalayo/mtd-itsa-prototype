variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name to use for the application"
  type        = string
  default     = "example.com"  # Change this to your actual domain
}

variable "domain_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
  sensitive   = true
}