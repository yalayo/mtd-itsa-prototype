# Cloudflare Workers Module Format Guide

## Understanding Module Format for Cloudflare Workers

When working with Cloudflare Workers that use D1 databases, it's essential to use the Module format rather than the Service Worker format. This document explains what this means and how we've implemented it in our project.

## Module vs Service Worker Format

Cloudflare Workers can be written in two formats:

1. **Service Worker Format** (Legacy)
   ```javascript
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request))
   })
   
   async function handleRequest(request) {
     return new Response('Hello world')
   }
   ```

2. **Module Format** (Modern)
   ```javascript
   export default {
     async fetch(request, env, ctx) {
       return new Response('Hello world')
     }
   }
   ```

## Why Module Format is Required for D1

The newer Module format is required for Cloudflare Workers that use certain bindings:
- D1 Database bindings
- Durable Objects
- Queue bindings

When using these features, your worker must use the Module format to ensure compatibility.

## How We've Implemented Module Format

Our project uses the following strategies to ensure proper Module format:

1. **Terraform Configuration**: 
   ```terraform
   resource "cloudflare_workers_script" "worker" {
     # ... other configuration ...
     module = true  # Explicitly set to module format
   }
   ```

2. **wrangler.toml Configuration**:
   ```toml
   # Explicitly set to module format
   type = "javascript"
   format = "modules"
   ```

3. **Build Pipeline**:
   Our GitHub Actions workflow uses esbuild to bundle the worker with the correct ESM format:
   ```shell
   npx esbuild server/worker.ts --platform=neutral --packages=external --bundle --format=esm --outfile=terraform/worker.js
   ```

4. **Export Syntax**:
   We ensure the exported worker properly adheres to the module format:
   ```javascript
   export default {
     async fetch(request, env, ctx) {
       // Worker implementation
     }
   }
   ```

## Troubleshooting

If you encounter the error:
```
D1 bindings require module-format workers. https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
```

Check that:
1. The worker script is using export syntax correctly
2. The `module = true` is set in Terraform
3. The `format = "modules"` is set in wrangler.toml
4. The esbuild command uses `--format=esm`

## Resources

- [Cloudflare Workers Module Format Documentation](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)
- [D1 Binding Documentation](https://developers.cloudflare.com/d1/reference/d1-client-specification/)