import { AppError } from '../utils/AppError.js';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

// Toda alteração exige JSON; formulários de outros sites não conseguem enviá-lo (research.md §5).
export function requireJson(req, _res, next) {
  if (METHODS_WITH_BODY.has(req.method) && !req.is('application/json')) {
    return next(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Envie os dados em JSON.'));
  }
  next();
}
