// Define globals for Cloudflare Workers environment
declare global {
  var storage: any;
}

// Import needed modules
import { createCloudflareStorage } from './cloudflare-storage.js';
import { registerRoutes } from './routes.js';
import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { log } from './vite.js';
import { IStorage } from './storage.js';

// Cloudflare Worker interface definitions
interface D1Database {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      all: () => Promise<{ results: any[] }>;
      first: () => Promise<any>;
      run: () => Promise<any>;
    };
  };
  // Add missing methods to match Cloudflare D1 interface
  batch: (statements: any[]) => Promise<any>;
  exec: (query: string) => Promise<any>;
  dump: () => Promise<any>;
}

interface Env {
  DB: D1Database;
}

// This function is now imported from cloudflare-storage.js
// We don't need to define it again here

// Convert Express app to Cloudflare Worker compatible Response
async function handleRequest(app: express.Express, request: Request): Promise<Response> {
  return new Promise<Response>((resolve) => {
    let body: string[] = [];
    let statusCode = 200;
    let statusMessage = 'OK';
    let headers = new Headers();

    // Create Express compatible request object
    const req: any = {
      ...request,
      url: new URL(request.url).pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(new URL(request.url).searchParams.entries()),
      path: new URL(request.url).pathname,
      body: null,
    };

    // Mock response object
    const res: any = {
      statusCode: 200,
      statusMessage: 'OK',
      headers: {},
      
      status(code: number) {
        statusCode = code;
        return this;
      },
      
      setHeader(name: string, value: string) {
        headers.set(name, value);
        this.headers[name] = value;
        return this;
      },
      
      getHeader(name: string) {
        return this.headers[name];
      },
      
      removeHeader(name: string) {
        headers.delete(name);
        delete this.headers[name];
        return this;
      },
      
      write(chunk: string) {
        body.push(chunk);
        return true;
      },
      
      end(chunk?: string) {
        if (chunk) body.push(chunk);
        
        // Create the final response
        const response = new Response(body.join(''), {
          status: statusCode,
          statusText: statusMessage,
          headers
        });
        
        resolve(response);
      },
      
      json(data: any) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
        return this;
      },
      
      sendFile(path: string, options: any) {
        // In Workers, we'd serve static files differently
        // Here we're just returning a basic HTML response
        this.setHeader('Content-Type', 'text/html');
        this.end('<!DOCTYPE html><html><head><title>Cloud Accountant</title></head><body><div id="root"></div><script src="/index.js"></script></body></html>');
        return this;
      }
    };
    
    // Parse request body if it exists
    request.json()
      .then(body => {
        req.body = body;
      })
      .catch(() => {
        // Body may not be JSON, that's ok
      })
      .finally(() => {
        // Forward the request to Express
        app(req, res, (err: Error) => {
          if (err) {
            res.status(500).json({ error: err.message });
          }
        });
      });
  });
}

// This is a special entry point for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    // Create Express app
    const app = express();
    
    // Configure global storage based on Cloudflare D1
    // Use any casting to bypass type checking as we're adapting the Cloudflare D1 interface
    globalThis.storage = createCloudflareStorage(env.DB as any);
    
    // Parse JSON requests
    app.use(express.json());
    
    // Log requests
    app.use((req, res, next) => {
      log(`${req.method} ${req.url}`, 'express');
      next();
    });
    
    // Register API routes
    await registerRoutes(app);
    
    // Handle static files and client-side routing
    app.get('*', (req, res) => {
      // For API requests that weren't handled, return 404
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      // For all other paths, serve the SPA index.html
      res.sendFile('index.html', { root: './dist' });
    });
    
    // Handle the request with our Express app
    const response = await handleRequest(app, request);
    
    // Add CORS headers if needed
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }
};