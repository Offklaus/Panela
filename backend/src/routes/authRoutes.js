import { Router } from 'express';

export function createAuthRoutes({ controller, requireAuth }) {
  const router = Router();
  router.post('/signup', controller.signup);
  router.post('/login', controller.login);
  router.post('/logout', requireAuth, controller.logout);
  router.get('/me', requireAuth, controller.me);
  router.post('/password-reset/request', controller.requestReset);
  router.post('/password-reset/confirm', controller.confirmReset);
  return router;
}
