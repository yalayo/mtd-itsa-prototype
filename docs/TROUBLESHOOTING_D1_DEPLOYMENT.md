# Troubleshooting Cloudflare D1 Deployment

This guide provides solutions to common issues encountered when deploying the application to Cloudflare Workers with D1 database.

## Module Format Requirements

Cloudflare Workers with D1 database bindings require the ES Module format. The following issues are commonly encountered:

### 1. Worker compilation fails with module format errors

**Problem**: The worker fails to compile with errors related to module format.

**Solution**:
- Ensure that your worker exports a default object using ES Module syntax:
  ```javascript
  export default {
    async fetch(request, env, ctx) {
      // Your worker code
    }
  };
  ```
- Check that the `compile-worker.sh` script uses the correct TypeScript options:
  ```
  npx tsc --module NodeNext --target ES2022 --moduleResolution NodeNext
  ```
- Verify that esbuild is configured with the right format:
  ```
  npx esbuild dist/server/cloudflare-worker.js --format=esm --platform=neutral
  ```

### 2. D1 binding not working in development

**Problem**: The D1 database works in production but not locally.

**Solution**:
- For local development, create a `wrangler.toml` file with:
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "cloud-accountant-db"
  database_id = "your-database-id"
  ```
- Run `wrangler dev` with `--local` flag to use local D1:
  ```
  npx wrangler dev --local
  ```

## TypeScript Configuration Issues

### 1. Path aliases not resolving

**Problem**: TypeScript can't resolve path aliases like `@shared/*` during compilation.

**Solution**:
- Use relative imports in the worker file:
  ```typescript
  import { type User } from '../shared/schema';
  // Instead of: import { type User } from '@shared/schema';
  ```
- Or create a temporary tsconfig for worker compilation:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@shared/*": ["./shared/*"]
      }
    }
  }
  ```

### 2. Interface compatibility issues

**Problem**: TypeScript errors when working with D1 database interfaces.

**Solution**:
- Use the proper Cloudflare D1 interface definitions:
  ```typescript
  interface D1Result<T = any> {
    results: T[];
    success: boolean;
    error?: string;
  }

  interface D1Statement {
    all: <T = any>() => Promise<D1Result<T>>;
    first: <T = any>() => Promise<T | null>;
    run: () => Promise<{ count: number }>;
  }

  interface D1PreparedStatement {
    bind: (...params: any[]) => D1Statement;
  }

  interface D1Database {
    prepare: (query: string) => D1PreparedStatement;
    batch: <T = any>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
    exec: (query: string) => Promise<{ count: number }>;
  }
  ```

## Deployment Issues

### 1. Worker deploys but returns 500 errors

**Problem**: The worker deploys successfully but returns 500 errors when accessed.

**Solution**:
- Check the worker logs in Cloudflare dashboard
- Add detailed error handling and logging:
  ```javascript
  try {
    // Your code
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), { status: 500 });
  }
  ```
- Verify D1 database is properly created and migrations are run
- Test the connection with a simple query:
  ```javascript
  const result = await env.DB.prepare('SELECT 1 as test').first();
  ```

### 2. Worker size exceeds limits

**Problem**: The compiled worker is too large (>1MB).

**Solution**:
- Use tree-shaking and minification in esbuild:
  ```
  npx esbuild --format=esm --platform=neutral --bundle --minify --tree-shaking=true
  ```
- Remove unnecessary dependencies and imports
- Create a simplified worker for Cloudflare that only contains essential functionality

## Database Migration Issues

### 1. Migration fails with SQL errors

**Problem**: Database migrations fail with SQL syntax errors.

**Solution**:
- Validate SQL syntax with an SQL linter
- Ensure migrations are compatible with SQLite (used by D1)
- Test migrations locally before deploying:
  ```
  npx wrangler d1 execute <DB_NAME> --local --file=migrations/001_initial.sql
  ```

### 2. Schema inconsistencies

**Problem**: The database schema doesn't match what the application expects.

**Solution**:
- Version your migrations and ensure they run in order
- Add a schema version table to track applied migrations
- Use database introspection to validate schema after migrations:
  ```sql
  SELECT name FROM sqlite_master WHERE type='table';
  PRAGMA table_info(users);
  ```

## Environment Troubleshooting

### 1. Missing environment variables

**Problem**: Deployment fails due to missing environment variables.

**Solution**:
- Ensure that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set
- Verify that `D1_DATABASE_ID` is set or automatically retrieved
- Add proper validation in the deployment script:
  ```javascript
  function checkEnvVars() {
    const requiredVars = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      console.error(`Missing variables: ${missing.join(', ')}`);
      process.exit(1);
    }
  }
  ```

### 2. Permissions issues

**Problem**: API token doesn't have sufficient permissions.

**Solution**:
- Ensure your Cloudflare API token has the following permissions:
  - Account.Workers Scripts:Edit
  - Account.Workers Routes:Edit
  - Account.D1:Edit
- Create a new token with the correct permissions in the Cloudflare dashboard