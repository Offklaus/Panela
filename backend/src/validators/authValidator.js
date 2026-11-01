import { PASSWORD_MIN_LENGTH } from '../config/domain.js';
import { AppError } from '../utils/AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invalid(message, field) {
  return new AppError(400, 'VALIDATION_ERROR', message, { field });
}

export function validateEmail(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw invalid('Informe um e-mail válido.', 'email');
  }
  return email;
}

export function validateNewPassword(value) {
  if (typeof value !== 'string' || value.length < PASSWORD_MIN_LENGTH) {
    throw invalid(`A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`, 'password');
  }
  return value;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw invalid('Informe a senha.', 'password');
  }
  return value;
}

export function validateResetToken(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw invalid('O link de recuperação está incompleto.', 'token');
  }
  return value;
}
