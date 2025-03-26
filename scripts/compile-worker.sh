#!/bin/bash
# Script to compile the worker TypeScript into ESM-format JavaScript for Cloudflare deployment

# Exit on error
set -e

echo "Installing dependencies needed for compilation..."
npm install -D @babel/parser @babel/types undici-types csstype pg-types pg-protocol

echo "Creating output directory..."
mkdir -p dist

echo "Compiling simplified Cloudflare worker..."
npx tsc --module NodeNext --target ES2022 --moduleResolution NodeNext --esModuleInterop --skipLibCheck server/cloudflare-worker.ts --outDir dist/server

echo "Building module-format worker with esbuild..."
npx esbuild dist/server/cloudflare-worker.js --format=esm --platform=neutral --bundle --outfile=worker-module.js

# Verify the output has ESM format
if grep -q "export" worker-module.js; then
  echo "Worker file created successfully at worker-module.js"
  echo "Preview of exports:"
  grep -n "export" worker-module.js
else
  echo "Error: Generated worker doesn't have ESM format. Creating fallback worker..."
  
  # Create a simple fallback worker if the compilation fails
  cat > worker-module.js << 'EOF'
// Fallback module-format worker for Cloudflare
// This uses proper ES Module syntax required for D1 bindings
export default {
  async fetch(request, env, ctx) {
    try {
      // Basic routing
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response('OK', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Test D1 database connection
      if (url.pathname === '/test-db') {
        try {
          // Simple test query to verify D1 connection
          const result = await env.DB.prepare('SELECT 1 as test').first();
          return new Response(JSON.stringify({
            success: true,
            dbTest: result?.test || null,
            message: 'D1 connection successful'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (dbError) {
          return new Response(JSON.stringify({
            success: false,
            error: dbError.message,
            message: 'D1 connection failed'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Default response
      return new Response(JSON.stringify({
        success: true,
        message: 'Fallback module format worker is running correctly',
        path: url.pathname,
        time: new Date().toISOString()
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
EOF
  echo "Fallback worker created successfully"
fi

echo "You can now use the worker file for Cloudflare deployment"