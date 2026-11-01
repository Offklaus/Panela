import { AppError } from '../utils/AppError.js';

export function createRequireAuth(sessions) {
  return function requireAuth(req, _res, next) {
    const token = req.cookies?.sid;
    const organizer = sessions.resolveSession(token);
    if (!organizer) {
      return next(new AppError(401, 'UNAUTHENTICATED', 'Entre na sua conta para continuar.'));
    }
    req.organizer = organizer;
    req.sessionToken = token;
    next();
  };
}
