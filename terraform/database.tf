resource "cloudflare_d1_database" "db" {
	name   = "mtd-itsa-prototype"
	account_id = var.cloudflare_account_id
}