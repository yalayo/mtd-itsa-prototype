// dist/server/cloudflare-worker.js
var cloudflare_worker_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400"
          }
        });
      }
      if (url.pathname === "/health") {
        return new Response("OK", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(url.pathname, request, env);
      }
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
            <div class="logo">\u2601\uFE0F\u{1F4CA}</div>
            <h1>Cloud Accountant</h1>
            <p>This is the production deployment of Cloud Accountant.</p>
            <p>Please access the application through the main frontend URL.</p>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
async function handleApiRequest(path, request, env) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    if (path === "/api/test-db") {
      const result = await env.DB.prepare("SELECT 1 as test").first();
      return new Response(JSON.stringify({
        success: true,
        dbTest: result?.test || null,
        message: "D1 connection successful"
      }), { status: 200, headers });
    }
    if (path.startsWith("/api/users/")) {
      const segments = path.split("/").filter(Boolean);
      if (segments.length === 3 && request.method === "GET") {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
        if (!result) {
          return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers });
        }
        return new Response(JSON.stringify(result), { status: 200, headers });
      }
      if (segments.length === 4 && segments[3] === "transactions" && request.method === "GET") {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM transactions 
          WHERE userId = ? 
          ORDER BY date DESC
        `).bind(userId).all();
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
      if (segments.length === 4 && segments[3] === "categories" && request.method === "GET") {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM categories 
          WHERE userId = ?
        `).bind(userId).all();
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
      if (segments.length === 4 && segments[3] === "tax-reports" && request.method === "GET") {
        const userId = parseInt(segments[2]);
        const result = await env.DB.prepare(`
          SELECT * FROM tax_reports 
          WHERE userId = ?
          ORDER BY year DESC, quarter DESC
        `).bind(userId).all();
        return new Response(JSON.stringify(result.results), { status: 200, headers });
      }
    }
    if (path === "/api/currencies" && request.method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM currencies").all();
      return new Response(JSON.stringify(result.results), { status: 200, headers });
    }
    return new Response(JSON.stringify({
      error: "API endpoint not found",
      path
    }), { status: 404, headers });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), { status: 500, headers });
  }
}
export {
  cloudflare_worker_default as default
};
