#!/bin/bash
# Script to deploy a module-format worker directly with Wrangler
# This is for debugging the Terraform module format issue

# Ensure the script exits on error
set -e

echo "Creating minimal module-format worker..."
cat > worker-module.js << 'EOF'
// Minimal module-format worker
export default {
  async fetch(request, env, ctx) {
    return new Response("Hello World in module format!");
  }
};
EOF

echo "Creating wrangler.toml configuration..."
cat > wrangler-test.toml << 'EOF'
name = "mtd-itsa-test"
main = "worker-module.js"
compatibility_date = "2024-01-01"

# Explicitly set to module format for D1 compatibility
type = "javascript"
format = "modules" 

# D1 database binding
[[d1_databases]]
binding = "DB"
database_name = "TEST_DB"
database_id = "YOUR_DB_ID" # Will be replaced by the script
EOF

# Check if we have necessary environment variables
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set"
    exit 1
fi

# Create a test D1 database or use existing
echo "Creating test D1 database..."
DB_INFO=$(npx wrangler d1 create TEST_DB --json)
DB_ID=$(echo $DB_INFO | grep -o '"uuid":"[^"]*"' | cut -d':' -f2 | tr -d '"')

echo "Using D1 database ID: $DB_ID"

# Update the wrangler.toml with the database ID
sed -i "s/YOUR_DB_ID/$DB_ID/g" wrangler-test.toml

echo "Deploying worker with wrangler..."
npx wrangler deploy --config wrangler-test.toml

echo "Deployment complete. Testing worker..."
WORKER_URL=$(npx wrangler whoami --json | grep -o '"deploymentUrl":"[^"]*"' | cut -d':' -f2- | tr -d '"')
curl -s $WORKER_URL

echo "Clean up test files? (y/n)"
read -r CLEANUP
if [ "$CLEANUP" = "y" ]; then
    rm worker-module.js wrangler-test.toml
    echo "Cleanup complete"
fi