import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../../src/services/authService.js';
import { createClock, createTestDb, expectCode } from './testDb.js';

const EMAIL = 'org@exemplo.com';
const PASSWORD = 'senha-boa-123';

let clock;
let auth;

beforeEach(() => {
  clock = createClock();
  auth = createAuthService({ db: createTestDb(), now: clock.now });
});

test('signup guarda o e-mail sem espaços nas pontas e em minúsculas', async () => {
  const organizer = await auth.signup({ email: '  Org@Exemplo.COM ', password: PASSWORD });
  assert.equal(organizer.email, EMAIL);
  assert.ok(organizer.id > 0);
});

test('signup recusa e-mail que já tem conta', async () => {
  await auth.signup({ email: EMAIL, password: PASSWORD });
  await assert.rejects(auth.signup({ email: 'ORG@exemplo.com', password: PASSWORD }), expectCode('EMAIL_TAKEN'));
});

test('signup recusa e-mail inválido e senha com menos de 8 caracteres', async () => {
  await assert.rejects(auth.signup({ email: 'sem-arroba', password: PASSWORD }), expectCode('VALIDATION_ERROR'));
  await assert.rejects(auth.signup({ email: EMAIL, password: '1234567' }), expectCode('VALIDATION_ERROR'));
});

test('login com a senha certa devolve o organizador', async () => {
  await auth.signup({ email: EMAIL, password: PASSWORD });
  const organizer = await auth.login({ email: ' ORG@exemplo.com', password: PASSWORD });
  assert.equal(organizer.email, EMAIL);
});

test('login com a senha errada responde "E-mail ou senha incorretos."', async () => {
  await auth.signup({ email: EMAIL, password: PASSWORD });
  await assert.rejects(auth.login({ email: EMAIL, password: 'errada-123' }), (error) => {
    assert.equal(error.code, 'INVALID_CREDENTIALS');
    assert.equal(error.message, 'E-mail ou senha incorretos.');
    return true;
  });
});

test('5 falhas seguidas bloqueiam por 15 minutos, mesmo com a senha certa', async () => {
  await auth.signup({ email: EMAIL, password: PASSWORD });
  for (let i = 0; i < 5; i++) {
    await assert.rejects(auth.login({ email: EMAIL, password: 'errada-123' }), expectCode('INVALID_CREDENTIALS'));
  }
  await assert.rejects(auth.login({ email: EMAIL, password: PASSWORD }), (error) => {
    assert.equal(error.code, 'LOGIN_LOCKED');
    assert.equal(error.extra.retryAfterSeconds, 900);
    return true;
  });

  clock.advanceMinutes(15);
  const organizer = await auth.login({ email: EMAIL, password: PASSWORD });
  assert.equal(organizer.email, EMAIL);
});

test('e-mail sem conta também é bloqueado depois de 5 falhas', async () => {
  for (let i = 0; i < 5; i++) {
    await assert.rejects(auth.login({ email: 'ninguem@exemplo.com', password: 'qualquer-1' }), expectCode('INVALID_CREDENTIALS'));
  }
  await assert.rejects(auth.login({ email: 'ninguem@exemplo.com', password: 'qualquer-1' }), expectCode('LOGIN_LOCKED'));
});

test('login certo zera o contador de falhas', async () => {
  await auth.signup({ email: EMAIL, password: PASSWORD });
  for (let i = 0; i < 4; i++) {
    await assert.rejects(auth.login({ email: EMAIL, password: 'errada-123' }), expectCode('INVALID_CREDENTIALS'));
  }
  await auth.login({ email: EMAIL, password: PASSWORD });
  for (let i = 0; i < 4; i++) {
    await assert.rejects(auth.login({ email: EMAIL, password: 'errada-123' }), expectCode('INVALID_CREDENTIALS'));
  }
  await auth.login({ email: EMAIL, password: PASSWORD });
});
