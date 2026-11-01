import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, hashPassword, hashToken, verifyPassword } from '../../src/utils/crypto.js';

test('verifyPassword aceita a senha certa', async () => {
  const stored = await hashPassword('senha-secreta');
  assert.equal(await verifyPassword('senha-secreta', stored), true);
});

test('verifyPassword recusa a senha errada', async () => {
  const stored = await hashPassword('senha-secreta');
  assert.equal(await verifyPassword('outra-senha', stored), false);
});

test('o hash guardado segue o formato scrypt$N$r$p$salt$hash', async () => {
  const parts = (await hashPassword('senha-secreta')).split('$');
  assert.equal(parts.length, 6);
  assert.deepEqual(parts.slice(0, 4), ['scrypt', '131072', '8', '1']);
  assert.ok(!parts.join('$').includes('senha-secreta'));
});

test('generateToken devolve 43 caracteres base64url e não se repete', () => {
  const first = generateToken();
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, generateToken());
});

test('hashToken é SHA-256 em hexadecimal e estável', () => {
  assert.match(hashToken('abc'), /^[0-9a-f]{64}$/);
  assert.equal(hashToken('abc'), hashToken('abc'));
  assert.notEqual(hashToken('abc'), hashToken('abd'));
});
