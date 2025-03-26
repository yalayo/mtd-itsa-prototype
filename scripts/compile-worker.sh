#!/bin/bash
# Script to compile the worker TypeScript into ESM-format JavaScript for Cloudflare deployment

# Exit on error
set -e

echo "Installing dependencies needed for compilation..."
npm install -D @babel/parser @babel/types undici-types csstype pg-types pg-protocol

echo "Creating output directory..."
mkdir -p dist

echo "Compiling TypeScript to JavaScript..."
npx tsc -p tsconfig.build.json

echo "Building module-format worker with esbuild..."
npx esbuild dist/server/worker.js --format=esm --platform=neutral --bundle --outfile=worker-module.js

# Verify the output has ESM format
if ! grep -q "export default" worker-module.js; then
  echo "Error: Generated worker doesn't have ESM format. Check the TypeScript source files."
  exit 1
fi

echo "Worker file created successfully at worker-module.js"
echo "You can now use this file for Cloudflare deployment"