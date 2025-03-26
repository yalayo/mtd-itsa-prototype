# CloudAccount Infrastructure

This directory contains the Terraform configuration for deploying the CloudAccount application to Cloudflare.

## Infrastructure Components

- **Cloudflare Workers**: Hosts the server-side application code
- **Cloudflare D1**: SQL database for data storage
- **Cloudflare KV**: Key-value store for session management
- **Cloudflare Pages**: Static asset hosting (for the SPA frontend)
- **Neon PostgreSQL**: External PostgreSQL database for more complex data relationships

## Prerequisites

1. A Cloudflare account with Workers, D1, and KV enabled
2. A Neon PostgreSQL database instance
3. Terraform and Terraform Cloud account setup

## Required Secrets

The following secrets need to be set in GitHub Actions:

- `TF_API_TOKEN`: Terraform Cloud API token
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with permission to manage Workers, KV, and D1
- `DATABASE_URL`: Connection string for the Neon PostgreSQL database

## Local Development

To work with this configuration locally:

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in your values
2. Run `terraform init` to initialize
3. Run `terraform plan` to see what changes would be applied
4. Run `terraform apply` to apply the changes

## CI/CD Process

The GitHub Actions workflow in `.github/workflows/cicd.yml` handles:

1. Building the application
2. Bundling it for Cloudflare Workers
3. Using Terraform to deploy the infrastructure
4. Running database migrations

## Notes

- The Cloudflare D1 database is used for session data and basic functionality
- For more complex data requirements, the application connects to a Neon PostgreSQL database