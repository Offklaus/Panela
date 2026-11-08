import * as clubModel from '../models/clubModel.js';
import { AppError } from '../utils/AppError.js';
import { validateNewClub } from '../validators/clubValidator.js';

const clubExists = () => new AppError(409, 'CLUB_EXISTS', 'Você já tem um time.');

// Sem time não há elenco nem sorteio (FR-018 da 005). `db` pode ser a transação de quem chama.
export async function hasClub(db, organizerId) {
  return Boolean(await clubModel.findByOrganizer(db, organizerId));
}

export async function requireClub(db, organizerId) {
  if (!(await hasClub(db, organizerId))) {
    throw new AppError(409, 'CLUB_REQUIRED', 'Crie o seu time no MyTeam primeiro.');
  }
}

// Time do MyTeam (feature 005). O elenco continua sendo o da conta (research §3 da 005).
export function createClubService({ db, now }) {
  return {
    getClub(organizerId) {
      return clubModel.findByOrganizer(db, organizerId);
    },

    async createClub(organizerId, input) {
      const { name, icon } = validateNewClub(input);
      const club = await clubModel.insert(db, { organizerId, name, icon, createdAt: now().toISOString() });
      if (!club) throw clubExists();
      return club;
    },
  };
}