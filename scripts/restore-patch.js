#!/usr/bin/env node

/**
 * This script restores the original server/vite.ts file after build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteServerPath = path.join(__dirname, '../server/vite.ts');

try {
  // Restore original file from backup
  if (fs.existsSync(`${viteServerPath}.bak`)) {
    fs.copyFileSync(`${viteServerPath}.bak`, viteServerPath);
    fs.unlinkSync(`${viteServerPath}.bak`);
    console.log('✅ Restored original server/vite.ts file');
  } else {
    console.log('⚠️ No backup file found. Nothing to restore.');
  }
} catch (err) {
  console.error('❌ Failed to restore server/vite.ts:', err);
  process.exit(1);
}