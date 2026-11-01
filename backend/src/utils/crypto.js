import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// Parâmetros mínimos da OWASP para scrypt (research.md §3).
const COST = 2 ** 17;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 256 * 1024 * 1024;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEMORY,
  });
  return ['scrypt', COST, BLOCK_SIZE, PARALLELIZATION, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [scheme, cost, blockSize, parallelization, salt, hash] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'base64');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
    maxmem: MAX_MEMORY,
  });
  return timingSafeEqual(actual, expected);
}

export function generateToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
