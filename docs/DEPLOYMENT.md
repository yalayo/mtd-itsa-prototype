# Deployment Guide

This application is designed to be deployed to Cloudflare Workers, utilizing Cloudflare D1 as the database. The deployment process is automated through GitHub Actions CI/CD pipeline and Terraform.

## Prerequisites

1. A Cloudflare account with Workers and D1 enabled
2. A GitHub repository for the project
3. A domain connected to Cloudflare (for custom domain deployment)

## Setup Steps

### 1. Cloudflare Configuration

1. Login to your Cloudflare dashboard
2. Create an API token with the following permissions:
   - Account.Workers Scripts:Edit
   - Account.Workers Routes:Edit
   - Account.D1:Edit
   - Zone.DNS:Edit (if using a custom domain)

3. Note your Cloudflare Account ID (found in the dashboard sidebar)
4. If using a custom domain, note the Zone ID of your domain

### 2. GitHub Repository Setup

1. Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `CLOUDFLARE_ZONE_ID`: Your domain's zone ID (if using a custom domain)

### 3. Terraform Configuration

1. Update the domain name in `terraform/variables.tf` with your actual domain:
   ```hcl
   variable "domain_name" {
     description = "Domain name to use for the application"
     type        = string
     default     = "your-domain.com"  # Change this to your actual domain
   }
   ```

### 4. Deployment Process

Once the above configuration is complete, the application will automatically deploy when:
- You push to the main branch
- You manually trigger the workflow in GitHub Actions

The CI/CD pipeline will:
1. Build the application
2. Set up the Cloudflare infrastructure using Terraform
3. Deploy the application to Cloudflare Workers
4. Run database migrations to set up the schema and sample data

### 5. Verification

After deployment, you can verify that everything is working by:
1. Checking the GitHub Actions workflow to ensure it completed successfully
2. Accessing your application at `https://app.your-domain.com` (if using a custom domain) or at the Cloudflare Workers subdomain (e.g., `https://cloudaccount-app.your-username.workers.dev`)
3. Testing the API endpoints to ensure the database is correctly set up

## Manual Deployment

If you prefer to deploy manually:

1. Install Wrangler CLI:
   ```
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```
   wrangler login
   ```

3. Create a D1 database:
   ```
   wrangler d1 create CLOUDACCOUNT_DB
   ```

4. Update the `database_id` in `wrangler.toml` with the ID returned from the previous command

5. Build the application:
   ```
   npm run build
   npx esbuild server/worker.ts --platform=neutral --packages=external --bundle --format=esm --outfile=dist/worker.js
   ```

6. Deploy to Cloudflare Workers:
   ```
   wrangler deploy
   ```

7. Run migrations:
   ```
   wrangler d1 execute CLOUDACCOUNT_DB --file=migrations/0000_initial_schema.sql
   wrangler d1 execute CLOUDACCOUNT_DB --file=migrations/0001_sample_data.sql
   ```

## Troubleshooting

### Common Issues

1. **Deployment fails with authentication errors**
   - Verify that your `CLOUDFLARE_API_TOKEN` has the correct permissions
   - Ensure the token is not expired

2. **Database migration errors**
   - Check that your D1 database was created correctly
   - Verify that migration SQL files are valid

3. **DNS issues with custom domain**
   - Ensure that your domain is correctly configured in Cloudflare
   - Check that the DNS records are properly set up

4. **Workers script fails to run**
   - Examine the Workers logs in the Cloudflare dashboard
   - Verify that all environment variables are correctly set

For more detailed assistance, refer to the Cloudflare Workers and D1 documentation.