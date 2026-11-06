import { AppError } from '../utils/AppError.js';

export function createRequireAuth(sessions) {
  return async function requireAuth(req, _res, next) {
    const token = req.cookies?.sid;
    const organizer = await sessions.resolveSession(token);
    if (!organizer) {
      return next(new AppError(401, 'UNAUTHENTICATED', 'Entre na sua conta para continuar.'));
    }
    req.organizer = organizer;
    req.sessionToken = token;
    next();
  };
}
