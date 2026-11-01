import { Router } from 'express';

export function createPlayerRoutes({ controller, requireAuth }) {
  const router = Router();
  router.get('/roster', requireAuth, controller.getRoster);
  router.post('/players', requireAuth, controller.addPlayer);
  router.put('/players/presence', requireAuth, controller.setAllPresence);
  router.patch('/players/:id', requireAuth, controller.updatePlayer);
  router.delete('/players/:id', requireAuth, controller.removePlayer);
  return router;
}
