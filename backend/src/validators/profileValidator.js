import { DOMINANT_FEET, NICKNAME_MAX_LENGTH, PROFILE_MAX_AGE, PROFILE_MIN_AGE } from '../config/domain.js';
import { AppError } from '../utils/AppError.js';
import { ageOn, isValidDate } from '../utils/dates.js';
import { validatePosition } from './playerValidator.js';

function invalid(message, field) {
  return new AppError(400, 'VALIDATION_ERROR', message, { field });
}

export function validateNickname(value) {
  const nickname = typeof value === 'string' ? value.trim() : '';
  if (!nickname) throw invalid('Informe o apelido.', 'nickname');
  if ([...nickname].length > NICKNAME_MAX_LENGTH) {
    throw invalid(`O apelido pode ter no máximo ${NICKNAME_MAX_LENGTH} caracteres.`, 'nickname');
  }
  return nickname;
}

// `today` é a data de hoje ("YYYY-MM-DD") no fuso do app (FR-003 e FR-005 da 006).
export function validateBirthDate(value, today) {
  if (value === undefined || value === null || value === '') throw invalid('Informe a data de nascimento.', 'birthDate');
  if (!isValidDate(value)) throw invalid('Data de nascimento inválida.', 'birthDate');
  if (value > today) throw invalid('A data de nascimento não pode ser no futuro.', 'birthDate');
  const age = ageOn(value, today);
  if (age < PROFILE_MIN_AGE || age > PROFILE_MAX_AGE) {
    throw invalid(`Confira a data: a idade precisa ficar entre ${PROFILE_MIN_AGE} e ${PROFILE_MAX_AGE} anos.`, 'birthDate');
  }
  return value;
}

export function validateFoot(value) {
  if (!DOMINANT_FEET.includes(value)) throw invalid('Escolha a perna dominante.', 'foot');
  return value;
}

// Um erro por vez, na ordem do formulário (research §4 da 006).
export function validateProfile(body, today) {
  return {
    nickname: validateNickname(body?.nickname),
    birthDate: validateBirthDate(body?.birthDate, today),
    position: validatePosition(body?.position),
    foot: validateFoot(body?.foot),
  };
}
