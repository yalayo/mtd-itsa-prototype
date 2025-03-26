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
  // Step 1: Apply patches for module resolution issues
  console.log('📦 Applying build patches...');
  execSync('node ' + path.join(__dirname, 'build-patch.js'), { stdio: 'inherit' });
  
  // Step 2: Run TypeScript compilation with patched files
  console.log('🔧 Compiling TypeScript...');
  execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
  
  // Step 3: Restore original files after successful compilation
  console.log('🧹 Cleaning up...');
  execSync('node ' + path.join(__dirname, 'restore-patch.js'), { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully');
} catch (error) {
  // Always attempt to restore original files even if compilation fails
  try {
    console.log('🧹 Cleaning up after error...');
    execSync('node ' + path.join(__dirname, 'restore-patch.js'), { stdio: 'inherit' });
  } catch (cleanupError) {
    console.error('⚠️ Warning: Failed to clean up after error:', cleanupError.message);
  }
  
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}