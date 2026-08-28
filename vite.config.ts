import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      // Helper to ensure Express-like methods exist on Connect res
      const polyfillRes = (res: any) => {
        if (!res.status) {
          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
        }
        if (!res.json) {
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };
        }
      };

      // URA DataService API handler
      server.middlewares.use('/api/ura', async (req: any, res: any, next: any) => {
        polyfillRes(res);
        try {
          const handlerModule = await import('./api/ura.js');
          await handlerModule.default(req, res);
        } catch (err: any) {
          console.error('API URA error:', err);
          res.status(500).json({ error: err.message || 'Internal Server Error' });
        }
      });

      // Gemini AI Insight API handler
      server.middlewares.use('/api/insight', async (req: any, res: any, next: any) => {
        polyfillRes(res);
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              req.body = JSON.parse(body || '{}');
            } catch {
              req.body = {};
            }
            try {
              const handlerModule = await import('./api/insight.js');
              await handlerModule.default(req, res);
            } catch (err: any) {
              console.error('API Insight error:', err);
              res.status(500).json({ error: err.message || 'Internal Server Error' });
            }
          });
          return;
        } else if (req.method === 'OPTIONS') {
          return res.status(200).end();
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
