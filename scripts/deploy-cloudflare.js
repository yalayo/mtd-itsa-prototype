/**
 * Cloudflare Worker Deployment Script
 * 
 * This script provides a direct way to deploy the worker to Cloudflare without Terraform
 * It handles all the steps necessary to prepare and deploy a module-format worker
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WORKER_NAME = 'cloudaccount-app';
const DB_NAME = 'CLOUDACCOUNT_DB';
const MIGRATIONS_DIR = 'migrations';

function checkEnvVars() {
  const requiredVars = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set them before running this script.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables verified');
}

function compileTypeScript() {
  console.log('🔨 Compiling TypeScript to JavaScript...');
  try {
    execSync('bash scripts/compile-worker.sh', { stdio: 'inherit' });
    console.log('✅ Compilation complete');
  } catch (error) {
    console.error('❌ TypeScript compilation failed:', error.message);
    process.exit(1);
  }
}

function createWranglerConfig() {
  console.log('📝 Creating wrangler deployment config...');
  
  const wranglerConfig = `name = "${WORKER_NAME}"
main = "worker-module.js"
compatibility_date = "2023-09-01"

# Required for D1 database bindings
workers_dev = true
compatibility_flags = ["nodejs_compat"]
# Explicitly set to module format for D1 compatibility
type = "javascript"
format = "modules"

[vars]
NODE_ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "${DB_NAME}"
database_id = "${process.env.D1_DATABASE_ID || ''}"

[triggers]
crons = ["0 */6 * * *"]  # Run currency rate updates every 6 hours
`;

  fs.writeFileSync('wrangler-deploy.toml', wranglerConfig);
  console.log('✅ Created wrangler-deploy.toml');
}

function deployWithWrangler() {
  console.log('🚀 Deploying worker to Cloudflare...');
  
  try {
    // Deploy the worker
    execSync('npx wrangler deploy --config wrangler-deploy.toml', { 
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Worker deployed successfully');
    
    // Create D1 database if it doesn't exist and run migrations
    if (!process.env.D1_DATABASE_ID) {
      console.log('🔍 No database ID found, checking if database exists...');
      
      try {
        const dbList = execSync('npx wrangler d1 list --json', { 
          encoding: 'utf8',
          env: process.env
        });
        
        const databases = JSON.parse(dbList);
        const existingDb = databases.find(db => db.name === DB_NAME);
        
        if (existingDb) {
          console.log(`✅ Using existing database: ${existingDb.name} (${existingDb.uuid})`);
          process.env.D1_DATABASE_ID = existingDb.uuid;
        } else {
          console.log(`🔧 Creating new database: ${DB_NAME}`);
          const createResult = execSync(`npx wrangler d1 create ${DB_NAME} --json`, {
            encoding: 'utf8',
            env: process.env
          });
          
          const newDb = JSON.parse(createResult);
          console.log(`✅ Database created: ${newDb.name} (${newDb.uuid})`);
          process.env.D1_DATABASE_ID = newDb.uuid;
        }
        
        // Update wrangler config with database ID
        createWranglerConfig();
        
        // Run migrations
        console.log('🔄 Running database migrations...');
        const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
          .filter(file => file.endsWith('.sql'))
          .sort(); // Ensure they run in order
        
        for (const migrationFile of migrationFiles) {
          console.log(`Running migration: ${migrationFile}`);
          execSync(`npx wrangler d1 execute ${DB_NAME} --file=${path.join(MIGRATIONS_DIR, migrationFile)}`, {
            stdio: 'inherit',
            env: process.env
          });
        }
        
        console.log('✅ Migrations complete');
        
        // Redeploy with the updated database binding
        console.log('🔄 Redeploying worker with database binding...');
        execSync('npx wrangler deploy --config wrangler-deploy.toml', { 
          stdio: 'inherit',
          env: process.env
        });
        console.log('✅ Worker redeployed with database binding');
      } catch (dbError) {
        console.error('❌ Database setup failed:', dbError.message);
        // Continue without database binding
      }
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  // Clean up is optional
}

async function main() {
  console.log('⚡ Starting Cloudflare deployment process');
  
  checkEnvVars();
  compileTypeScript();
  createWranglerConfig();
  deployWithWrangler();
  cleanup();
  
  console.log('\n✨ Deployment complete! Your application is now available on Cloudflare.');
  console.log(`🌐 Visit: https://${WORKER_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.workers.dev`);
}

main().catch(err => {
  console.error('Deployment script failed:', err);
  process.exit(1);
});