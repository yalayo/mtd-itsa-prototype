#!/usr/bin/env node
/**
 * Cloudflare Worker Deployment Script
 * 
 * This script provides a direct way to deploy the worker to Cloudflare without Terraform
 * It handles all the steps necessary to prepare and deploy a module-format worker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const WORKER_NAME = 'mtd-itsa-prototype';
const SOURCE_TS_FILE = path.join(__dirname, '../server/worker.ts');
const TEMP_DIR = path.join(__dirname, '../.deploy-temp');
const OUTPUT_JS_FILE = path.join(TEMP_DIR, 'worker.js');
const WRANGLER_CONFIG = path.join(TEMP_DIR, 'wrangler.toml');

// Create the temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Function to check if environment variables are set
function checkEnvVars() {
  const requiredVars = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CF_D1_DATABASE_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\x1b[31mError: Missing required environment variables:\x1b[0m');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these variables before running this script:');
    console.error('export CLOUDFLARE_API_TOKEN="your_token_here"');
    console.error('export CLOUDFLARE_ACCOUNT_ID="your_account_id"');
    console.error('export CF_D1_DATABASE_ID="your_d1_database_id"');
    process.exit(1);
  }
}

// Function to compile TypeScript to JavaScript
function compileTypeScript() {
  console.log('📝 Compiling TypeScript worker to JavaScript module...');
  try {
    // We'll use esbuild for a simpler build process
    const esbuildCommand = 'npx esbuild ' + 
      SOURCE_TS_FILE + 
      ' --bundle --format=esm --platform=neutral ' +
      `--outfile=${OUTPUT_JS_FILE}`;
    
    execSync(esbuildCommand, { stdio: 'inherit' });
    
    // Verify the output has proper export syntax
    const content = fs.readFileSync(OUTPUT_JS_FILE, 'utf8');
    if (!content.includes('export default')) {
      throw new Error('Compiled worker does not contain ESM export syntax');
    }
    
    console.log('\x1b[32m✓ TypeScript compiled successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m✕ Failed to compile TypeScript:\x1b[0m', error);
    process.exit(1);
  }
}

// Function to create a temporary wrangler.toml for deployment
function createWranglerConfig() {
  console.log('📝 Creating Wrangler configuration...');
  
  const config = `name = "${WORKER_NAME}"
main = "worker.js"
compatibility_date = "2024-01-01"

# Required for D1 database bindings
type = "javascript"
format = "modules"

[vars]
NODE_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "MTD_ITSA_DB"
database_id = "${process.env.CF_D1_DATABASE_ID}"

[triggers]
crons = ["0 */6 * * *"]  # Run currency rate updates every 6 hours
`;

  fs.writeFileSync(WRANGLER_CONFIG, config);
  console.log('\x1b[32m✓ Wrangler configuration created\x1b[0m');
}

// Function to deploy the worker with Wrangler
function deployWithWrangler() {
  console.log('🚀 Deploying worker with Wrangler...');
  try {
    // Change directory to the temp dir for deployment
    process.chdir(TEMP_DIR);
    
    // Deploy with Wrangler
    execSync('npx wrangler deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID
      }
    });
    
    console.log('\x1b[32m✓ Worker deployed successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m✕ Failed to deploy worker:\x1b[0m', error);
    process.exit(1);
  }
}

// Function to clean up temporary files
function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  console.log('\x1b[32m✓ Cleanup complete\x1b[0m');
}

// Main function
async function main() {
  console.log('\x1b[34m📦 Cloudflare Worker Deployment\x1b[0m');
  
  try {
    // Check for required environment variables
    checkEnvVars();
    
    // Compile TypeScript to JavaScript
    compileTypeScript();
    
    // Create Wrangler configuration
    createWranglerConfig();
    
    // Deploy with Wrangler
    deployWithWrangler();
    
    console.log('\x1b[32m✅ Deployment completed successfully!\x1b[0m');
    console.log(`Worker URL: https://${WORKER_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.workers.dev`);
  } catch (error) {
    console.error('\x1b[31m❌ Deployment failed:\x1b[0m', error);
    process.exit(1);
  } finally {
    // Clean up temporary files
    cleanup();
  }
}

// Run the main function
main();