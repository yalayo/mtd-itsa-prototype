import { createCloudflareStorage } from './cloudflare-storage';
import { registerRoutes } from './routes';
import express, { Request, Response, NextFunction } from 'express';
import { log } from './vite';

// Define the D1 database interface for Cloudflare Workers
interface D1Database {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      all: () => Promise<{ results: any[] }>;
      first: () => Promise<any>;
      run: () => Promise<any>;
    };
  };
}

// Define the Cloudflare Workers environment
interface Env {
  DB: D1Database;
}

// This is a special entry point for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    // Create Express app
    const app = express();
    
    // Configure global storage based on Cloudflare D1
    if (!globalThis.storage) {
      globalThis.storage = createCloudflareStorage(env.DB);
    }
    
    // Log requests in development
    app.use((req: Request, res: Response, next: NextFunction) => {
      log(`${req.method} ${req.url}`, 'express');
      next();
    });
    
    // Parse JSON requests
    app.use(express.json());
    
    // Register API routes
    await registerRoutes(app);
    
    // Handle static files and client-side routing
    app.get('*', (req: Request, res: Response) => {
      // For API requests that weren't handled, return 404
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      // For all other paths, serve the SPA index.html
      res.sendFile('index.html', { root: './dist' });
    });
    
    // Return a promise that resolves to a Response
    return new Promise<Response>((resolve) => {
      const expressResponse = {} as Response;
      const responsePromise = new Promise<void>((resolveFn) => {
        app.handle(request as any, expressResponse as any, () => {
          resolveFn();
        });
      });
      
      responsePromise.then(() => {
        // Add CORS headers
        expressResponse.headers = new Headers(expressResponse.headers);
        expressResponse.headers.set('Access-Control-Allow-Origin', '*');
        expressResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        expressResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        
        resolve(expressResponse);
      });
    });
  },
};