#!/usr/bin/env node

/**
 * Build script that handles patches and runs TypeScript compilation
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Starting build process...');

try {
  // Run pre-build preparations (module resolution patches)
  console.log('📦 Running pre-build preparations...');
  execSync('node ' + path.join(__dirname, 'pre-build.js'), { stdio: 'inherit' });
  
  // Run TypeScript compilation
  console.log('🔧 Compiling TypeScript...');
  execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}