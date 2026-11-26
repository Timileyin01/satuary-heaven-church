import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getHealthPayload,
  processBookingDispatch,
  processEnquiryDispatch,
} from './lib/dispatchCore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json(getHealthPayload());
  });

  app.post('/api/bookings/dispatch', async (req: Request, res: Response) => {
    const result = await processBookingDispatch(req.body);
    res.status(result.statusCode).json(result.payload);
  });

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const result = await processEnquiryDispatch(req.body);
    res.status(result.statusCode).json(result.payload);
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'API endpoint not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sanctuary Haven server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
