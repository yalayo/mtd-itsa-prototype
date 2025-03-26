/**
 * This adapter file helps resolve the vite.config import at runtime
 * without modifying the existing code structure.
 */

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Dynamically load and parse the vite.config.ts file
 */
async function loadViteConfig() {
  try {
    const configPath = path.resolve(__dirname, '..', 'vite.config.ts');
    
    // Check if the file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`vite.config.ts not found at: ${configPath}`);
    }
    
    // For ESM with TypeScript, we need to import the compiled JS version
    // This assumes the vite.config.ts has been transpiled to JS during build
    const { default: viteConfig } = await import('../vite.config.js');
    return viteConfig;
  } catch (error) {
    console.error('Error loading vite.config:', error);
    // Return a minimal fallback config to prevent complete failure
    return {
      plugins: [],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '..', 'client', 'src'),
          '@shared': path.resolve(__dirname, '..', 'shared'),
        }
      },
      root: path.resolve(__dirname, '..', 'client'),
    };
  }
}

export default await loadViteConfig();