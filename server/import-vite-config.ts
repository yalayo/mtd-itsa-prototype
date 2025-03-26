/**
 * This file provides a solution for importing the vite.config.ts file
 * while maintaining compatibility with the existing code structure.
 * 
 * It can be used by the build process to generate a module that exports
 * the vite config when imported from server/vite.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Generates a JavaScript module that exports the vite.config
 * This module will be used to satisfy the import in server/vite.ts
 */
function generateViteConfigModule() {
  const viteConfigPath = path.resolve(rootDir, 'vite.config.ts');
  const targetPath = path.resolve(rootDir, 'vite.config.js');
  
  // Check if the vite.config.ts file exists
  if (!fs.existsSync(viteConfigPath)) {
    console.error(`Error: vite.config.ts not found at ${viteConfigPath}`);
    process.exit(1);
  }
  
  // Create a JavaScript module that re-exports the config
  const moduleContent = `
// This is an auto-generated file that provides the vite config at runtime
// DO NOT EDIT - This file is regenerated during the build process

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// This matches the export from the original vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
`;
  
  // Write the module to disk
  fs.writeFileSync(targetPath, moduleContent, 'utf8');
  console.log(`✅ Generated vite.config.js at ${targetPath}`);
}

// If this file is executed directly, generate the module
if (import.meta.url === `file://${__filename}`) {
  generateViteConfigModule();
}

export { generateViteConfigModule };