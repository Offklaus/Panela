import { CLUB_ICONS, CLUB_NAME_MAX_LENGTH, DEFAULT_CLUB_ICON } from '../config/domain.js';
import { AppError } from '../utils/AppError.js';

function invalid(message, field) {
  return new AppError(400, 'VALIDATION_ERROR', message, { field });
}

export function validateClubName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) throw invalid('Informe o nome do time.', 'name');
  if ([...name].length > CLUB_NAME_MAX_LENGTH) {
    throw invalid(`O nome do time pode ter no máximo ${CLUB_NAME_MAX_LENGTH} caracteres.`, 'name');
  }
  return name;
}

// Sem ícone, o time fica com a bola (FR-003 da 005).
export function validateClubIcon(value) {
  if (value === undefined) return DEFAULT_CLUB_ICON;
  if (!CLUB_ICONS.includes(value)) throw invalid('Escolha um ícone da lista.', 'icon');
  return value;
}

export function validateNewClub(body) {
  return { name: validateClubName(body?.name), icon: validateClubIcon(body?.icon) };
}