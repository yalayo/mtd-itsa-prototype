#!/usr/bin/env node

/**
 * Pre-build script to prepare the codebase for building
 * Handles TypeScript module resolution issues
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Running pre-build preparation...');

try {
  // Apply build patch for module resolution issues
  execSync('node ' + path.join(__dirname, 'build-patch.js'), { stdio: 'inherit' });
  
  console.log('✅ Pre-build completed successfully');
} catch (error) {
  console.error('❌ Pre-build failed:', error.message);
  process.exit(1);
}