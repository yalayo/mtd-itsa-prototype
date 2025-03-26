# Understanding Cloudflare Module Format Workers

This guide explains the module format required for Cloudflare Workers, especially when using D1 database bindings.

## Module Format vs. Service Worker Format

Cloudflare Workers supports two formats:

1. **Service Worker Format (Legacy)**
   ```javascript
   addEventListener('fetch', event => {
     event.respondWith(handleRequest(event.request));
   });

   async function handleRequest(request) {
     return new Response('Hello world');
   }
   ```

2. **Module Format (Recommended)**
   ```javascript
   export default {
     async fetch(request, env, ctx) {
       return new Response('Hello world');
     }
   };
   ```

**Important:** D1 database bindings require using the Module Format.

## Key Differences

| Feature | Module Format | Service Worker Format |
|---------|--------------|----------------------|
| Export style | ES Modules with default export | Global scope with event listeners |
| Environment bindings | Passed as arguments | Accessed through global scope |
| TypeScript support | Better type safety | Less type-safe |
| D1 Database | Supported | Not supported |
| Imports | Can use ES module imports | Limited import options |

## Setting Up Module Format

### 1. TypeScript Configuration

When using TypeScript, ensure your `tsconfig.json` has the right settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext", 
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 2. Worker Structure

Your worker file should be structured like this:

```typescript
// Type definitions for Cloudflare D1
interface D1Result<T = any> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: any;
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

// Environment bindings interface
interface Env {
  DB: D1Database;  // D1 database binding
  // Add other bindings as needed
}

// Main worker export
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Your worker logic here
      return new Response('Hello World');
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
```

### 3. Bundling for Deployment

When bundling your worker for deployment:

1. Use esbuild to preserve ES module format:
   ```bash
   npx esbuild worker.js --format=esm --platform=neutral --bundle --outfile=worker-bundle.js
   ```

2. Ensure the output file still contains the `export default` statement.

3. Configure `wrangler.toml` for module format:
   ```toml
   name = "your-worker"
   main = "worker-bundle.js"
   compatibility_date = "2023-05-18"
   
   # Explicitly set module format
   type = "javascript"
   format = "modules"
   
   [[d1_databases]]
   binding = "DB"
   database_name = "your-database"
   database_id = "your-database-id"
   ```

## Using D1 in Module Format

### Querying Data

```typescript
// Get a single item
const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId)
  .first();

// Get multiple items
const result = await env.DB.prepare('SELECT * FROM products LIMIT 10')
  .all();
const products = result.results;

// Insert data
await env.DB.prepare('INSERT INTO logs (message, timestamp) VALUES (?, ?)')
  .bind('User logged in', new Date().toISOString())
  .run();
```

### Transaction Support

```typescript
// Batch queries in a transaction
const stmt1 = env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
  .bind(amount, fromAccountId);
  
const stmt2 = env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
  .bind(amount, toAccountId);
  
const stmt3 = env.DB.prepare('INSERT INTO transfers (from_id, to_id, amount) VALUES (?, ?, ?)')
  .bind(fromAccountId, toAccountId, amount);

// Execute all statements in a transaction
await env.DB.batch([stmt1, stmt2, stmt3]);
```

## Best Practices

1. **Error Handling**: Always use try/catch blocks and return meaningful error responses:
   ```typescript
   try {
     // Your code
   } catch (error) {
     return new Response(JSON.stringify({
       success: false,
       error: error.message
     }), { 
       status: 500,
       headers: { 'Content-Type': 'application/json' }
     });
   }
   ```

2. **CORS Support**: Include CORS headers for API endpoints:
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type'
   };
   
   // Handle OPTIONS requests for CORS preflight
   if (request.method === 'OPTIONS') {
     return new Response(null, {
       status: 204,
       headers: corsHeaders
     });
   }
   ```

3. **Parameter Binding**: Always use parameter binding instead of string interpolation to prevent SQL injection:
   ```typescript
   // Good
   const result = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
     .bind(email)
     .first();
   
   // Bad - vulnerable to SQL injection
   const result = await env.DB.prepare(`SELECT * FROM users WHERE email = '${email}'`)
     .first();
   ```

## Troubleshooting

1. **"Module format is required for D1 bindings"**:
   - Ensure your worker uses `export default { fetch: ... }`
   - Check that esbuild is using `--format=esm`

2. **"Cannot read properties of undefined (reading 'prepare')"**:
   - This usually means your D1 binding isn't correctly set up
   - Verify your `wrangler.toml` has the correct D1 database configuration
   - Check that you're accessing the binding through `env.DB`

3. **TypeScript errors with D1 methods**:
   - Use the D1 interfaces provided in this guide
   - Make sure you're using the correct method chaining: `.prepare().bind().first()`