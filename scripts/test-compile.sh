#!/bin/bash
# Simple script to test TypeScript compilation with the simple worker

# Exit on error
set -e

echo "Creating output directory..."
mkdir -p dist/server

echo "Compiling TypeScript to JavaScript..."
npx tsc --module NodeNext --target ES2022 --moduleResolution NodeNext --esModuleInterop --skipLibCheck server/simple-worker.ts --outDir dist/server

echo "Building module-format worker with esbuild..."
npx esbuild dist/server/simple-worker.js --format=esm --platform=neutral --bundle --outfile=test-worker-module.js

echo "Verifying module format..."
if grep -q "export" test-worker-module.js; then
  echo "Worker file created successfully with proper ESM format at test-worker-module.js"
  echo "Content of the worker file:"
  tail -5 test-worker-module.js
else
  echo "Error: Generated worker doesn't have ESM format."
  exit 1
fi