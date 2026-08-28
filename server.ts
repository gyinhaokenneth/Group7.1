import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import uraHandler from './api/ura.js';
import insightHandler from './api/insight.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // URA DataService endpoints
  app.all('/api/ura*', async (req, res) => {
    try {
      await uraHandler(req, res);
    } catch (err: any) {
      console.error('Express URA Error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Gemini Insight endpoints
  app.all('/api/insight*', async (req, res) => {
    try {
      await insightHandler(req, res);
    } catch (err: any) {
      console.error('Express Insight Error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
