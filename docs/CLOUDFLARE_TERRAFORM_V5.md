# Cloudflare Terraform Provider v5.1.0 Guide

## Module Format Workers with Terraform v5.1.0

When using Cloudflare Terraform Provider version 5.1.0, there are some important differences in how module format Workers are configured compared to previous versions.

## Key Changes in v5.1.0

1. **No `module = true` Attribute**:
   - In previous versions, you could set `module = true` on the `cloudflare_workers_script` resource
   - In v5.1.0, this attribute is **not supported** and will cause an error:
     ```
     Error: Unsupported argument
     
     on main.tf line 33, in resource "cloudflare_workers_script" "worker":
     33:   module = true
     
     An argument named "module" is not expected here.
     ```

2. **Implicit Module Detection**:
   - Worker format (module or service worker) is determined by the **content** of the script
   - If your script uses ES module syntax (`export default {...}`), it will be treated as a module format Worker

## Correct Configuration for v5.1.0

### Terraform Configuration:

```terraform
resource "cloudflare_workers_script" "worker" {
  account_id  = var.cloudflare_account_id
  script_name = "my-worker"
  compatibility_date = "2024-01-01"
  content     = file("worker.js")
  
  # No module = true attribute - format is determined by script content
  
  bindings = [{
    name = "DB"
    type = "d1"
    id = cloudflare_d1_database.db.id
  }]
}
```

### Worker Script Content:

Your worker script must use ES module syntax:

```javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    // Worker implementation
    return new Response("Hello, world!");
  }
};
```

## CI/CD Considerations

When setting up your CI/CD pipeline, ensure that:

1. The build process generates proper ES module syntax worker scripts
2. The final content of the worker script uses `export default` format
3. If using esbuild, ensure it's configured with `--format=esm`

## Additional Resources

- [Cloudflare Terraform Provider Documentation](https://registry.terraform.io/providers/cloudflare/cloudflare/5.1.0/docs/resources/workers_script)
- [Cloudflare Workers Module Format Guide](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/)