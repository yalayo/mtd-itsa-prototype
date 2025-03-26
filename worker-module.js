// Standalone module-format worker for testing Terraform deployment
// This file is in the root directory for Terraform to find it easily

export default {
  async fetch(request, env, ctx) {
    try {
      // Basic routing
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health') {
        return new Response('OK', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Test D1 database connection
      if (url.pathname === '/test-db') {
        try {
          // Simple test query to verify D1 connection
          const result = await env.DB.prepare('SELECT 1 as test').first();
          return new Response(JSON.stringify({
            success: true,
            dbTest: result?.test || null,
            message: 'D1 connection successful'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (dbError) {
          return new Response(JSON.stringify({
            success: false,
            error: dbError.message,
            message: 'D1 connection failed'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Default response
      return new Response(JSON.stringify({
        success: true,
        message: 'Module format worker is running correctly',
        path: url.pathname,
        time: new Date().toISOString()
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};