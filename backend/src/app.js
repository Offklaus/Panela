import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requireJson } from './middlewares/requireJson.js';
import { createApiRouter } from './routes/index.js';
import { AppError } from './utils/AppError.js';
import { defaultRng } from './utils/random.js';

export function createApp({ db, env, mailer, rng = defaultRng, now = () => new Date() }) {
  const app = express();

  app.use(helmet());
  app.use(cookieParser());
  app.use(
    '/api',
    requireJson,
    express.json(),
    createApiRouter({ db, env, mailer, rng, now }),
    (_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Rota não encontrada.')),
  );

  if (env.frontendDistDir) {
    serveFrontend(app, env.frontendDistDir);
  }

  app.use(errorHandler);
  return app;
}

// Em produção, a tela compilada é servida na mesma origem da API (research.md §15).
function serveFrontend(app, distDir) {
  const indexFile = path.join(distDir, 'index.html');
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(indexFile);
  });
}
