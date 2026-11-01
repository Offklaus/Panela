import { Router } from 'express';

export function createDrawRoutes({ controller, requireAuth }) {
  const router = Router();
  router.get('/draw', requireAuth, controller.getDraw);
  router.post('/draw', requireAuth, controller.createDraw);
  return router;
}
