output "worker_script_id" {
  description = "ID of the deployed Cloudflare Worker script"
  value       = cloudflare_worker_script.cloudaccount_app.id
}

output "database_id" {
  description = "ID of the Cloudflare D1 database"
  value       = cloudflare_d1_database.cloudaccount_db.id
}

output "application_url" {
  description = "URL where the application is deployed"
  value       = "https://${cloudflare_worker_domain.cloudaccount_domain.hostname}"
}