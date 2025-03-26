# Cloudflare Workers Module Format Guide

## Overview

Cloudflare Workers supports two formats for writing workers:
1. **Service Worker format** (legacy)
2. **ES Module format** (current recommended approach)

D1 Database bindings **require** the ES Module format. This document explains how to properly structure your worker code for D1 compatibility.

## Requirements for D1 Database Bindings

When using D1 database bindings with Cloudflare Workers, your worker script must:

1. Use ES Module syntax with `export default` 
2. Explicitly define the worker as a JavaScript module

## Correct Module Format Example

```javascript
// This is the proper ES Module format for Cloudflare Workers with D1 bindings
export default {
  async fetch(request, env, ctx) {
    // Access D1 database through env.DB
    const result = await env.DB.prepare('SELECT 1 as test').first();
    return new Response(JSON.stringify(result));
  }
};
```

## Deployment with Terraform

When using Terraform to deploy Workers with D1 bindings:

1. Ensure your worker script uses proper ES Module syntax
2. Use the `file` function to include the worker script content:

```hcl
resource "cloudflare_workers_script" "worker" {
  account_id = var.cloudflare_account_id
  script_name = "my-worker"
  compatibility_date = "2024-01-01"
  content = file("${path.module}/worker.js")  # Path to your module-format worker

  bindings = [{
    name = "DB"
    type = "d1"
    id = cloudflare_d1_database.db.id
  }]
}
```

## Deployment with Wrangler

When using Wrangler CLI, specify the module format in `wrangler.toml`:

```toml
name = "my-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

# Explicitly define module format
type = "javascript"
format = "modules"

# D1 database binding
[[d1_databases]]
binding = "DB"
database_name = "my_database"
database_id = "xxx"
```

## TypeScript Compilation for Module Format

When working with TypeScript, ensure compilation targets ES modules:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    // Other options...
  }
}
```

## Common Errors

### Error Code 10021
```
D1 bindings require module-format workers. 
https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
```

This error occurs when:
- Your worker uses Service Worker format instead of ES Module format
- The script does not have a proper `export default` statement
- The deployment configuration doesn't specify module format

## Debugging Tips

1. Verify your worker has a proper `export default` statement
2. If using TypeScript, check the compiled output for ES Module syntax
3. Test with a minimal module-format worker to validate configuration
4. When deploying with Wrangler directly, explicitly set `format = "modules"`