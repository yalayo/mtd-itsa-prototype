# Troubleshooting Cloudflare D1 Deployment

This guide addresses common issues encountered when deploying the application to Cloudflare Workers with D1 database integration.

## Error Code 10021: Service Worker Format Not Compatible with D1

### Problem

During deployment, you might encounter an error like:

```
Error: Worker format "service-worker" is not compatible with the D1 Binding "DB". 
Error: Failed to deploy to Cloudflare Workers
Error code: 10021
```

### Solution

This error occurs because Cloudflare D1 requires workers to be in "module format" (ESM) rather than the traditional "service worker format." To fix this:

1. **Check worker format in wrangler.toml**:
   ```toml
   # Explicitly set to module format for D1 compatibility
   type = "javascript"
   format = "modules"
   ```

2. **Verify export syntax in your worker file**: The worker JavaScript must use proper ES module exports:
   ```javascript
   // Correct format
   export default {
     async fetch(request, env, ctx) {
       // ...
     }
   };
   ```

3. **Run the compilation script**: 
   ```bash
   bash scripts/compile-worker.sh
   ```
   This script handles the TypeScript-to-JavaScript conversion and ensures proper ESM format.

## Failed Migrations or Database Errors

### Problem

Database migrations fail to apply or you get database-related errors when accessing the application.

### Solution

1. **Check D1 database existence**:
   ```bash
   npx wrangler d1 list
   ```

2. **Create D1 database if it doesn't exist**:
   ```bash
   npx wrangler d1 create MTD_ITSA_DB
   ```

3. **Manually run migrations**:
   ```bash
   npx wrangler d1 execute MTD_ITSA_DB --file=migrations/0000_initial_schema.sql
   npx wrangler d1 execute MTD_ITSA_DB --file=migrations/0001_sample_data.sql
   ```

4. **Verify database tables**:
   ```bash
   npx wrangler d1 execute MTD_ITSA_DB --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```

## TypeScript Compilation Issues

### Problem

TypeScript fails to compile properly for Cloudflare Workers deployment.

### Solution

1. **Update TypeScript configuration**: Ensure your `tsconfig.build.json` has the correct settings:
   ```json
   {
     "compilerOptions": {
       "noEmit": false,
       "outDir": "./dist",
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "allowSyntheticDefaultImports": true,
       "skipLibCheck": true
     }
   }
   ```

2. **Check for TypeScript errors**: Run TypeScript compilation explicitly to see any errors:
   ```bash
   npx tsc -p tsconfig.build.json --noEmit
   ```

3. **Use the simple test script**: Test compilation with a simplified worker:
   ```bash
   bash scripts/test-compile.sh
   ```

## Deployment Timeouts or Network Issues

### Problem

The deployment process times out or fails with network-related errors.

### Solution

1. **Verify Cloudflare credentials**: Ensure your Cloudflare API token and account ID are correctly set in your environment variables.

2. **Deploy in stages**: 
   - First deploy just the worker without migrations
   - Then run migrations separately

3. **Use manual direct deployment**:
   ```bash
   # Compile the worker
   bash scripts/compile-worker.sh
   
   # Deploy with explicit config
   npx wrangler deploy --config wrangler-deploy.toml
   ```

## Testing the Deployment

To verify your deployment works correctly:

1. **Check the worker status**:
   ```bash
   npx wrangler deployments list
   ```

2. **Test database connection** by visiting `/test-db` endpoint on your deployed worker.

3. **Check application logs** in the Cloudflare dashboard to see if there are any runtime errors.

## Need More Help?

If you continue to experience issues:

1. Review the [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
2. Check the [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
3. Use the direct deployment method via Wrangler instead of Terraform if persistent issues occur