# Create a custom domain for the worker
resource "cloudflare_worker_domain" "cloudaccount_domain" {
	account_id = var.cloudflare_account_id
	hostname   = "app.${var.domain_name}"
	service    = cloudflare_worker_script.worker.name
	zone_id    = var.domain_zone_id
}

# Create DNS record for the domain
resource "cloudflare_record" "worker_record" {
	zone_id = var.domain_zone_id
	name    = "app"
	value   = "100::"  # Special value for Cloudflare Workers
	type    = "AAAA"
	proxied = true
}