import { DEFAULT_RATING, NAME_MAX_LENGTH, POSITIONS, RATING_MAX, RATING_MIN } from '../config/domain.js';
import { AppError } from '../utils/AppError.js';

function invalid(message, field) {
  return new AppError(400, 'VALIDATION_ERROR', message, { field });
}

// Chave de unicidade do nome: ignora maiúsculas e minúsculas (os espaços das pontas já saíram).
export function toNameKey(name) {
  return name.toLocaleLowerCase('pt-BR');
}

export function validateName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) throw invalid('Informe o nome ou apelido.', 'name');
  if ([...name].length > NAME_MAX_LENGTH) {
    throw invalid(`O nome pode ter no máximo ${NAME_MAX_LENGTH} caracteres.`, 'name');
  }
  return name;
}

export function validateRating(value) {
  if (!Number.isInteger(value) || value < RATING_MIN || value > RATING_MAX) {
    throw invalid(`O nível vai de ${RATING_MIN} a ${RATING_MAX} estrelas.`, 'rating');
  }
  return value;
}

export function validatePresent(value) {
  if (typeof value !== 'boolean') throw invalid('Informe se o jogador está presente.', 'present');
  return value;
}

// ATA ou DEF; "sem posição" só existe para jogadores cadastrados antes da feature 003.
export function validatePosition(value) {
  if (!POSITIONS.includes(value)) throw invalid('Escolha a posição.', 'position');
  return value;
}

export function validateNewPlayer(body) {
  return {
    name: validateName(body?.name),
    rating: body?.rating === undefined ? DEFAULT_RATING : validateRating(body.rating),
    position: validatePosition(body?.position),
  };
}

export function validatePlayerUpdate(body) {
  const changes = {};
  if (body?.rating !== undefined) changes.rating = validateRating(body.rating);
  if (body?.present !== undefined) changes.present = validatePresent(body.present);
  if (body?.position !== undefined) changes.position = validatePosition(body.position);
  if (Object.keys(changes).length === 0) throw invalid('Envie o nível, a presença ou a posição do jogador.');
  return changes;
}

export function validatePlayerId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(404, 'NOT_FOUND', 'Jogador não encontrado.');
  return id;
}
