import { SESSION_DAYS } from '../config/domain.js';
import * as sessionModel from '../models/sessionModel.js';
import { generateToken, hashToken } from '../utils/crypto.js';

export function createSessionService({ db, now }) {
  return {
    async createSession(organizerId) {
      const token = generateToken();
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + SESSION_DAYS * 86_400_000);
      await sessionModel.create(db, {
        organizerId,
        tokenHash: hashToken(token),
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
      return { token, expiresAt };
    },

    async resolveSession(token) {
      if (typeof token !== 'string' || token.length === 0) return null;
      const tokenHash = hashToken(token);
      const organizer = await sessionModel.findValidByTokenHash(db, tokenHash, now().toISOString());
      if (!organizer) {
        await sessionModel.deleteByTokenHash(db, tokenHash);
        return null;
      }
      return organizer;
    },

    async endSession(token) {
      if (typeof token === 'string' && token.length > 0) {
        await sessionModel.deleteByTokenHash(db, hashToken(token));
      }
    },

    async endAllSessions(organizerId) {
      await sessionModel.deleteAllForOrganizer(db, organizerId);
    },
  };
}
