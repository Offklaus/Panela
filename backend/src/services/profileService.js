import { APP_TIME_ZONE } from '../config/domain.js';
import * as profileModel from '../models/profileModel.js';
import { ageOn, localDate } from '../utils/dates.js';
import { validateProfile } from '../validators/profileValidator.js';

// Craque, o perfil de jogador da conta (feature 006). A idade não é guardada: sai da data de
// nascimento e da data de hoje no fuso do app a cada leitura (research §3 da 006).
export function createProfileService({ db, now }) {
  const today = () => localDate(now(), APP_TIME_ZONE);

  function withAge(row, date) {
    if (!row) return null;
    const { nickname, birthDate, position, foot } = row;
    return { nickname, birthDate, age: ageOn(birthDate, date), position, foot };
  }

  return {
    async getProfile(organizerId) {
      return withAge(await profileModel.findByOrganizer(db, organizerId), today());
    },

    async saveProfile(organizerId, input) {
      const date = today();
      const profile = validateProfile(input, date);
      const row = await profileModel.upsert(db, { organizerId, ...profile, updatedAt: now().toISOString() });
      return withAge(row, date);
    },
  };
}
