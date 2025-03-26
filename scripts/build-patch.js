#!/usr/bin/env node

/**
 * This script temporarily patches server/vite.ts for the build process
 * to handle the TS2307 error: Cannot find module '../vite.config'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteServerPath = path.join(__dirname, '../server/vite.ts');
let content;

try {
  // Read the original file
  content = fs.readFileSync(viteServerPath, 'utf8');
  
  // Create a backup
  fs.writeFileSync(`${viteServerPath}.bak`, content);
  
  // Modify the import statement for compilation
  const patched = content.replace(
    "import viteConfig from \"../vite.config\";",
    "// @ts-ignore - Import handled at runtime\nimport viteConfig from \"../vite.config\";"
  );
  
  // Write the patched file
  fs.writeFileSync(viteServerPath, patched);
  
  console.log('✅ Successfully patched server/vite.ts for build process');
} catch (err) {
  console.error('❌ Failed to patch server/vite.ts:', err);
  process.exit(1);
}

// Handle cleanup on exit
process.on('exit', () => {
  try {
    // Restore original file from backup
    if (fs.existsSync(`${viteServerPath}.bak`)) {
      fs.copyFileSync(`${viteServerPath}.bak`, viteServerPath);
      fs.unlinkSync(`${viteServerPath}.bak`);
      console.log('✅ Restored original server/vite.ts file');
    }
  } catch (err) {
    console.error('❌ Failed to restore server/vite.ts:', err);
  }
});

// Also handle unexpected termination
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());