import { Router } from 'express';

export function createProfileRoutes({ controller, requireAuth }) {
  const router = Router();
  router.get('/profile', requireAuth, controller.getProfile);
  router.put('/profile', requireAuth, controller.saveProfile);
  return router;
}
