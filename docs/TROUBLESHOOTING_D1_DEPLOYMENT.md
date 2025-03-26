# Troubleshooting D1 Deployment Issues

## Common Error: Code 10021 - D1 bindings require module-format workers

If you encounter this error when deploying with Terraform:

```
Error: failed to make http request

  with cloudflare_workers_script.worker,
  on main.tf line 26, in resource "cloudflare_workers_script" "worker":
  26: resource "cloudflare_workers_script" "worker" {

PUT "https://api.cloudflare.com/client/v4/accounts/***/workers/scripts/mtd-itsa-prototype":
400 Bad Request {
  "result": null,
  "success": false,
  "errors": [
    {
      "code": 10021,
      "message": "D1 bindings require module-format workers. https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/"
    }
  ],
  "messages": []
}
```

## Solution Steps

### 1. Ensure your worker file uses ESM module format syntax

Your worker script must use ES Module syntax with `export default`:

```javascript
// Correct format:
export default {
  async fetch(request, env, ctx) {
    // Your code here
  }
};

// NOT the service worker format:
// addEventListener('fetch', event => { ... })
```

### 2. Check Terraform file path resolution

When using `file()` function in Terraform, ensure the path is correctly resolved:

```hcl
content = file("${path.root}/worker-module.js")  // Use path.root for absolute path from project root
```

### 3. Alternative: Deploy directly with Wrangler

If Terraform deployment continues to fail, use the provided scripts:

```bash
# Make the deployment script executable
chmod +x scripts/deploy-cloudflare.js

# Set required environment variables
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CF_D1_DATABASE_ID="your_d1_database_id"

# Run the deployment script
node scripts/deploy-cloudflare.js
```

### 4. Check your wrangler.toml configuration

Ensure your wrangler.toml explicitly specifies the module format:

```toml
# Required for D1 database bindings
type = "javascript"
format = "modules"
```

### 5. Run this test to confirm worker format compatibility

Create a minimal test worker with just the module syntax and try deploying it:

```javascript
// test-worker.js
export default {
  async fetch() {
    return new Response("Hello from module format worker");
  }
};
```

Then deploy it with wrangler to verify:

```bash
npx wrangler deploy test-worker.js --name test-module-format
```

### 6. GitHub Actions Workflow

We've provided a GitHub Actions workflow in `.github/workflows/deploy-worker.yml` that handles:

1. Compiling TypeScript to JavaScript with ESM format
2. Creating the proper wrangler.toml configuration
3. Deploying directly with Wrangler

You can trigger this workflow manually from the GitHub Actions tab.

## Further Resources

- [Cloudflare Workers Module Format Guide](./CLOUDFLARE_MODULE_FORMAT.md)
- [Official Cloudflare Documentation on Module Workers](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)
- [Terraform Cloudflare Provider Documentation](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/workers_script)