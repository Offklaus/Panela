import { LOGIN_LOCK_MINUTES, LOGIN_MAX_FAILURES } from '../config/domain.js';
import * as loginThrottleModel from '../models/loginThrottleModel.js';
import * as organizerModel from '../models/organizerModel.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { validateEmail, validateNewPassword, validatePassword } from '../validators/authValidator.js';

const UNIQUE_VIOLATION = '23505';

const emailTaken = () =>
  new AppError(409, 'EMAIL_TAKEN', 'Já existe uma conta com esse e-mail.', { field: 'email' });

const invalidCredentials = () => new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');

function loginLocked(lockedUntil, now) {
  const retryAfterSeconds = Math.max(1, Math.ceil((new Date(lockedUntil).getTime() - now.getTime()) / 1000));
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return new AppError(
    429,
    'LOGIN_LOCKED',
    `Muitas tentativas. Tente de novo em ${minutes === 1 ? '1 minuto' : `${minutes} minutos`}.`,
    { extra: { retryAfterSeconds } },
  );
}

// Hash descartável para e-mails sem conta: o tempo de resposta não revela se a conta existe.
let dummyHash;
const getDummyHash = () => (dummyHash ??= hashPassword('senha-que-nao-existe'));

export function createAuthService({ db, now }) {
  return {
    async signup(input) {
      const email = validateEmail(input?.email);
      const password = validateNewPassword(input?.password);
      if (await organizerModel.findByEmail(db, email)) throw emailTaken();

      const passwordHash = await hashPassword(password);
      try {
        return await organizerModel.create(db, { email, passwordHash, createdAt: now().toISOString() });
      } catch (error) {
        if (error.code === UNIQUE_VIOLATION) throw emailTaken();
        throw error;
      }
    },

    async login(input) {
      const email = validateEmail(input?.email);
      const password = validatePassword(input?.password);
      const current = now();

      const throttle = await loginThrottleModel.get(db, email);
      if (throttle?.lockedUntil && throttle.lockedUntil > current.toISOString()) {
        throw loginLocked(throttle.lockedUntil, current);
      }

      const organizer = await organizerModel.findByEmail(db, email);
      const passwordMatches = organizer
        ? await verifyPassword(password, organizer.passwordHash)
        : (await verifyPassword(password, await getDummyHash()), false);

      if (!passwordMatches) {
        await loginThrottleModel.registerFailure(db, email, {
          now: current,
          maxFailures: LOGIN_MAX_FAILURES,
          lockMinutes: LOGIN_LOCK_MINUTES,
        });
        throw invalidCredentials();
      }

      await loginThrottleModel.reset(db, email);
      return { id: organizer.id, email: organizer.email };
    },
  };
}
