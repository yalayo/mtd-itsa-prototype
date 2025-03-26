# CI/CD Pipeline Documentation

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD) to automate the build, test, and deployment process to Cloudflare Workers.

## Pipeline Overview

The CI/CD workflow is defined in `.github/workflows/deploy.yml` and is triggered on:
- Pushes to the main branch
- Manual triggers through the GitHub Actions UI

## Workflow Steps

### 1. Setup Environment

The pipeline begins by setting up a clean Ubuntu environment and checking out the code:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
```

### 2. Build Application

Next, Node.js is set up and the application is built:

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend and worker
        run: |
          npm run build
          npx esbuild server/worker.ts --platform=neutral --packages=external --bundle --format=esm --outfile=terraform/worker.js
```

During the build phase:
1. The React frontend is compiled into static assets
2. The Cloudflare Worker script is bundled into a single JS file

### 3. Infrastructure Provisioning with Terraform

Terraform is used to provision and manage the Cloudflare infrastructure:

```yaml
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.5.0'
      
      - name: Terraform Init
        run: |
          cd terraform
          terraform init
      
      - name: Terraform Plan
        run: |
          cd terraform
          terraform plan
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: |
          cd terraform
          terraform apply -auto-approve
```

This step:
1. Initializes Terraform with the Cloudflare provider
2. Creates a plan to show what changes will be made
3. Applies the plan to create/update resources (D1 database, Workers script, DNS records)

### 4. Database Migrations

After infrastructure is set up, database migrations are run:

```yaml
      - name: Run Database Migrations
        if: github.ref == 'refs/heads/main'
        run: |
          npx wrangler d1 execute CLOUDACCOUNT_DB --file=migrations/0000_initial_schema.sql
          npx wrangler d1 execute CLOUDACCOUNT_DB --file=migrations/0001_sample_data.sql
```

This ensures the Cloudflare D1 database has the correct schema and initial data.

## Required Secrets

The pipeline requires the following GitHub secrets:

- `CLOUDFLARE_API_TOKEN`: API token for authenticating with Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_ZONE_ID`: Zone ID for the domain (if using a custom domain)

## Infrastructure as Code

The Terraform configuration in the `terraform/` directory defines:

1. **Database**: A Cloudflare D1 database for storing application data
2. **Worker Script**: The serverless function that runs the application
3. **Domain Configuration**: Custom domain setup for the application (optional)
4. **DNS Records**: Required DNS entries for the application

## Testing the Pipeline

To test the pipeline:

1. Push a change to the main branch
2. Monitor the GitHub Actions execution
3. Check the Cloudflare dashboard to verify resource creation
4. Access the deployed application URL to confirm it's working correctly

## Troubleshooting

If the pipeline fails, common issues include:

- **Authentication Errors**: Check that the Cloudflare API token has the correct permissions
- **Build Failures**: Ensure all dependencies are properly declared
- **Terraform State Conflicts**: May occur if manual changes were made to Cloudflare resources
- **Migration Errors**: Check SQL syntax and that tables don't already exist

For more information on deploying to Cloudflare Workers, see the [official documentation](https://developers.cloudflare.com/workers/get-started/guide/).