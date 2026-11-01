import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';
import { createDrawController } from '../controllers/drawController.js';
import { createPlayerController } from '../controllers/playerController.js';
import { createRequireAuth } from '../middlewares/requireAuth.js';
import { createAuthService } from '../services/authService.js';
import { createDrawService } from '../services/drawService.js';
import { createPasswordResetService } from '../services/passwordResetService.js';
import { createRosterService } from '../services/rosterService.js';
import { createSessionService } from '../services/sessionService.js';
import { createAuthRoutes } from './authRoutes.js';
import { createDrawRoutes } from './drawRoutes.js';
import { createPlayerRoutes } from './playerRoutes.js';

// Monta as rotas de /api. Cada história registra as suas aqui.
export function createApiRouter({ db, env, mailer, rng, now }) {
  const sessions = createSessionService({ db, now });
  const auth = createAuthService({ db, now });
  const passwordReset = createPasswordResetService({ db, now, mailer, appUrl: env.appUrl, sessions });
  const roster = createRosterService({ db, now });
  const draws = createDrawService({ db, rng, now });
  const requireAuth = createRequireAuth(sessions);

  const router = Router();
  router.use(
    '/auth',
    createAuthRoutes({ controller: createAuthController({ auth, sessions, passwordReset, env }), requireAuth }),
  );
  router.use(createPlayerRoutes({ controller: createPlayerController({ roster }), requireAuth }));
  router.use(createDrawRoutes({ controller: createDrawController({ draws }), requireAuth }));
  return router;
}
