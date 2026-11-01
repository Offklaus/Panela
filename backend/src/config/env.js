import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REQUIRED_IN_PRODUCTION = ['APP_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

function resolveFromBackend(value) {
  return path.resolve(backendRoot, value);
}

export function loadEnv(source = process.env) {
  const isProduction = source.NODE_ENV === 'production';

  if (isProduction) {
    const missing = REQUIRED_IN_PRODUCTION.filter((name) => !source[name]);
    if (missing.length > 0) {
      throw new Error(`Variáveis de ambiente obrigatórias em produção: ${missing.join(', ')}`);
    }
  }

  const port = Number(source.PORT || 3000);
  if (!Number.isInteger(port) || port < 0) {
    throw new Error(`PORT inválida: ${source.PORT}`);
  }

  return {
    isProduction,
    port,
    databasePath: resolveFromBackend(source.DATABASE_PATH || path.join('data', 'panela.sqlite')),
    appUrl: (source.APP_URL || 'http://localhost:5173').replace(/\/+$/, ''),
    frontendDistDir: source.FRONTEND_DIST_DIR ? resolveFromBackend(source.FRONTEND_DIST_DIR) : null,
    smtp: source.SMTP_HOST
      ? {
          host: source.SMTP_HOST,
          port: Number(source.SMTP_PORT || 587),
          user: source.SMTP_USER || '',
          pass: source.SMTP_PASS || '',
        }
      : null,
    mailFrom: source.MAIL_FROM || 'Times de Society <no-reply@localhost>',
  };
}
