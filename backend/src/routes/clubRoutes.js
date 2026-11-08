import { Router } from 'express';

export function createClubRoutes({ controller, requireAuth }) {
  const router = Router();
  router.get('/club', requireAuth, controller.getClub);
  router.post('/club', requireAuth, controller.createClub);
  return router;
}