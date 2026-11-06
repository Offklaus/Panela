import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../../src/services/authService.js';
import { createPasswordResetService } from '../../src/services/passwordResetService.js';
import { createSessionService } from '../../src/services/sessionService.js';
import { createClock, createTestDb, expectCode } from './testDb.js';

const EMAIL = 'org@exemplo.com';
const OLD_PASSWORD = 'senha-antiga';
const NEW_PASSWORD = 'senha-nova-123';

let clock;
let auth;
let sessions;
let service;
let mails;
let organizer;

beforeEach(async () => {
  const db = await createTestDb();
  clock = createClock();
  mails = [];
  const mailer = {
    async sendPasswordReset(to, link) {
      mails.push({ to, link });
    },
  };
  auth = createAuthService({ db, now: clock.now });
  sessions = createSessionService({ db, now: clock.now });
  service = createPasswordResetService({ db, now: clock.now, mailer, appUrl: 'http://app.test', sessions });
  organizer = await auth.signup({ email: EMAIL, password: OLD_PASSWORD });
});

const tokenFrom = (link) => decodeURIComponent(link.split('token=')[1]);

test('pedido para conta existente envia um e-mail com o link de nova senha', async () => {
  await service.requestReset({ email: 'ORG@exemplo.com' });
  assert.equal(mails.length, 1);
  assert.equal(mails[0].to, EMAIL);
  assert.match(mails[0].link, /^http:\/\/app\.test\/#\/nova-senha\?token=.+/);
});

test('pedido para e-mail sem conta não envia nada e não falha', async () => {
  await service.requestReset({ email: 'ninguem@exemplo.com' });
  assert.equal(mails.length, 0);
});

test('no máximo 3 e-mails por conta por hora', async () => {
  for (let i = 0; i < 4; i++) await service.requestReset({ email: EMAIL });
  assert.equal(mails.length, 3);

  clock.advanceMinutes(61);
  await service.requestReset({ email: EMAIL });
  assert.equal(mails.length, 4);
});

test('o link vence depois de 60 minutos', async () => {
  await service.requestReset({ email: EMAIL });
  clock.advanceMinutes(60);
  await assert.rejects(
    service.confirmReset({ token: tokenFrom(mails[0].link), password: NEW_PASSWORD }),
    expectCode('INVALID_RESET_TOKEN'),
  );
});

test('o link vale uma vez só', async () => {
  await service.requestReset({ email: EMAIL });
  const token = tokenFrom(mails[0].link);
  await service.confirmReset({ token, password: NEW_PASSWORD });
  await assert.rejects(service.confirmReset({ token, password: 'outra-senha-1' }), expectCode('INVALID_RESET_TOKEN'));
});

test('confirmar troca a senha e encerra todas as sessões', async () => {
  const { token: sessionToken } = await sessions.createSession(organizer.id);
  await service.requestReset({ email: EMAIL });
  await service.confirmReset({ token: tokenFrom(mails[0].link), password: NEW_PASSWORD });

  assert.equal(await sessions.resolveSession(sessionToken), null);
  assert.equal((await auth.login({ email: EMAIL, password: NEW_PASSWORD })).id, organizer.id);
  await assert.rejects(auth.login({ email: EMAIL, password: OLD_PASSWORD }), expectCode('INVALID_CREDENTIALS'));
});

test('senha nova curta ou link ausente são recusados', async () => {
  await service.requestReset({ email: EMAIL });
  await assert.rejects(
    service.confirmReset({ token: tokenFrom(mails[0].link), password: 'curta' }),
    expectCode('VALIDATION_ERROR'),
  );
  await assert.rejects(service.confirmReset({ password: NEW_PASSWORD }), expectCode('VALIDATION_ERROR'));
});
