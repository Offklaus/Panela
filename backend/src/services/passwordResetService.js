import { RESET_MAX_PER_HOUR, RESET_TOKEN_MINUTES } from '../config/domain.js';
import * as organizerModel from '../models/organizerModel.js';
import * as passwordResetModel from '../models/passwordResetModel.js';
import { AppError } from '../utils/AppError.js';
import { generateToken, hashPassword, hashToken } from '../utils/crypto.js';
import { validateEmail, validateNewPassword, validateResetToken } from '../validators/authValidator.js';

const invalidToken = () => new AppError(400, 'INVALID_RESET_TOKEN', 'Este link não vale mais. Peça um novo.');

export function createPasswordResetService({ db, now, mailer, appUrl, sessions }) {
  return {
    // Responde igual com ou sem conta (FR-006); o e-mail sai sem esperar, para o tempo não denunciar a conta.
    async requestReset(input) {
      const email = validateEmail(input?.email);
      const organizer = organizerModel.findByEmail(db, email);
      if (!organizer) return;

      const current = now();
      const oneHourAgo = new Date(current.getTime() - 60 * 60_000).toISOString();
      if (passwordResetModel.countCreatedSince(db, organizer.id, oneHourAgo) >= RESET_MAX_PER_HOUR) return;

      const token = generateToken();
      passwordResetModel.create(db, {
        organizerId: organizer.id,
        tokenHash: hashToken(token),
        createdAt: current.toISOString(),
        expiresAt: new Date(current.getTime() + RESET_TOKEN_MINUTES * 60_000).toISOString(),
      });

      const link = `${appUrl}/#/nova-senha?token=${encodeURIComponent(token)}`;
      mailer.sendPasswordReset(organizer.email, link).catch((error) => {
        console.error('Falha ao enviar o e-mail de nova senha:', error);
      });
    },

    async confirmReset(input) {
      const token = validateResetToken(input?.token);
      const password = validateNewPassword(input?.password);

      const reset = passwordResetModel.findByTokenHash(db, hashToken(token));
      const nowIso = now().toISOString();
      if (!reset || reset.usedAt || reset.expiresAt <= nowIso) throw invalidToken();

      const passwordHash = await hashPassword(password);
      db.transaction(() => {
        if (!passwordResetModel.markUsed(db, reset.id, nowIso)) throw invalidToken();
        organizerModel.updatePasswordHash(db, reset.organizerId, passwordHash);
      })();
      sessions.endAllSessions(reset.organizerId);
    },
  };
}
