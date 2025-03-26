// Simple module-format worker for Cloudflare with D1 database access
// This is specifically designed for production deployment

// D1 interface based on Cloudflare documentation
interface D1Result<T = any> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface D1Statement {
  all: <T = any>() => Promise<D1Result<T>>;
  first: <T = any>() => Promise<T | null>;
  run: () => Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind: (...params: any[]) => D1Statement;
  first: <T = any>() => Promise<T | null>;
  all: <T = any>() => Promise<D1Result<T>>;
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  batch: <T = any>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
  exec: (query: string) => Promise<D1ExecResult>;
  dump: () => Promise<ArrayBuffer>;
}

interface Env {
  DB: D1Database;
}

/**
 * Main worker entry point
 */
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    try {
      // Basic routing
      const url = new URL(request.url);
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
      }
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response('OK', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(url.pathname, request, env);
      }
      
      // Default response - simulated static file serving for SPA
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cloud Accountant</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8f9fa;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              text-align: center;
              padding: 40px 20px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #1a73e8;
              margin-bottom: 20px;
            }
            p {
              font-size: 18px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">☁️📊</div>
            <h1>Cloud Accountant</h1>
            <p>This is the production deployment of Cloud Accountant.</p>
            <p>Please access the application through the main frontend URL.</p>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};

/**
 * Handle API requests
 */
async function handleApiRequest(path: string, request: Request, env: Env): Promise<Response> {
  // Common response headers for API
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  try {
    // Test DB connection
    if (path === '/api/test-db') {
      const result = await env.DB.prepare('SELECT 1 as test').first();
      return new Response(JSON.stringify({
        success: true,
        dbTest: result?.test || null,
        message: 'D1 connection successful'
      }), { status: 200, headers });
    }
    
    // User endpoints
    if (path.startsWith('/api/users/')) {
      const segments = path.split('/').filter(Boolean);
      
      // Get user
      if (segments.length === 3 && request.method === 'GET') {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
          .bind(userId)
          .first();
          
        if (!result) {
          return new Response(JSON.stringify({ error: 'User not found' }), 
            { status: 404, headers });
        }
        
        return new Response(JSON.stringify(result), { status: 200, headers });
      }
      
      // Get user transactions
      if (segments.length === 4 && segments[3] === 'transactions' && request.method === 'GET') {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM transactions 
          WHERE userId = ? 
          ORDER BY date DESC
        `).bind(userId).all();
          
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
      
      // Get user categories
      if (segments.length === 4 && segments[3] === 'categories' && request.method === 'GET') {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM categories 
          WHERE userId = ?
        `).bind(userId).all();
          
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
      
      // Get user tax reports
      if (segments.length === 4 && segments[3] === 'tax-reports' && request.method === 'GET') {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM tax_reports 
          WHERE userId = ?
          ORDER BY year DESC, quarter DESC
        `).bind(userId).all();
          
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
    }
    
    // Currencies endpoint
    if (path === '/api/currencies' && request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM currencies').all();
      return new Response(JSON.stringify(result.results), { status: 200, headers });
    }
    
    // Default API response
    return new Response(JSON.stringify({ 
      error: 'API endpoint not found',
      path: path
    }), { status: 404, headers });
    
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), { status: 500, headers });
  }
}