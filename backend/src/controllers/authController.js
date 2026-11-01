import { SESSION_DAYS } from '../config/domain.js';

const RESET_REQUESTED_MESSAGE =
  'Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha. O link vale por 1 hora.';

export function createAuthController({ auth, sessions, passwordReset, env }) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    path: '/',
  };

  function startSession(res, organizer) {
    const { token } = sessions.createSession(organizer.id);
    res.cookie('sid', token, { ...cookieOptions, maxAge: SESSION_DAYS * 86_400_000 });
  }

  return {
    async signup(req, res) {
      const organizer = await auth.signup(req.body);
      startSession(res, organizer);
      res.status(201).json({ organizer });
    },

    async login(req, res) {
      const organizer = await auth.login(req.body);
      startSession(res, organizer);
      res.json({ organizer });
    },

    logout(req, res) {
      sessions.endSession(req.sessionToken);
      res.clearCookie('sid', cookieOptions);
      res.status(204).end();
    },

    me(req, res) {
      res.json({ organizer: req.organizer });
    },

    async requestReset(req, res) {
      await passwordReset.requestReset(req.body);
      res.status(202).json({ message: RESET_REQUESTED_MESSAGE });
    },

    async confirmReset(req, res) {
      await passwordReset.confirmReset(req.body);
      res.status(204).end();
    },
  };
}
