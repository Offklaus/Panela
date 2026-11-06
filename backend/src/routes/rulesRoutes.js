import { Router } from 'express';

export function createRulesRoutes({ controller }) {
  const router = Router();
  router.get('/rules', controller.getRules);
  return router;
}
