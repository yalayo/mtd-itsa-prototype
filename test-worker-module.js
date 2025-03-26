// dist/server/simple-worker.js
var simple_worker_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/health") {
        return new Response("OK", {
          status: 200,
          headers: { "Content-Type": "text/plain" }
        });
      }
      if (url.pathname === "/test-db") {
        try {
          const result = await env.DB.prepare("SELECT 1 as test").first();
          return new Response(JSON.stringify({
            success: true,
            dbTest: result?.test || null,
            message: "D1 connection successful"
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (dbError) {
          return new Response(JSON.stringify({
            success: false,
            error: dbError.message,
            message: "D1 connection failed"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Simple module format worker is running correctly",
        path: url.pathname,
        time: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
export {
  simple_worker_default as default
};
