# Cloudflare Module Format Workers

This document explains how we handle Cloudflare Workers deployment with D1 database integration in this project.

## Background

Cloudflare Workers with D1 database bindings require the worker to be in "module format" (ES modules with explicit exports). This is different from the traditional "service worker format" that was previously the default.

## Implementation

Our project uses:

1. **TypeScript source files** in `server/` directory
2. **Compilation process** to convert TypeScript to JavaScript 
3. **ESM format bundling** to ensure Cloudflare compatibility
4. **Fallback mechanism** in case compilation fails

## Deployment Methods

### 1. GitHub Actions CI/CD

The project includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that:

- Compiles TypeScript to JavaScript
- Bundles the worker code with esbuild in ESM format
- Creates a fallback worker if compilation fails
- Deploys the worker using either Terraform or Wrangler

### 2. Manual Deployment

You can manually compile and deploy the worker using:

```bash
# Compile the worker
bash scripts/compile-worker.sh

# Deploy with Wrangler
npx wrangler deploy --config wrangler.toml
```

## Troubleshooting

### Error Code 10021

If you see error code 10021 during deployment, it means Cloudflare is expecting a module-format worker but detected a service-worker format. Solutions:

1. Ensure the compiler produces ESM format exports
2. In wrangler.toml, include:
   ```toml
   format = "modules"
   ```
3. Check the resulting JavaScript file for a proper `export default`

### TypeScript Compilation Issues

Our TypeScript configuration in `tsconfig.build.json` includes:

```json
{
  "compilerOptions": {
    "noEmit": false,
    "outDir": "./dist",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    ...
  }
}
```

The specific combination of `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` is required to ensure ESM compatibility.

## Testing

You can verify the module format with:

```bash
# Compile and check
bash scripts/test-compile.sh

# Verify exports
grep -n "export" worker-module.js
```

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/)
- [Cloudflare D1 Bindings Documentation](https://developers.cloudflare.com/d1/platform/bindings/)