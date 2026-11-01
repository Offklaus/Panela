import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './testServer.js';

const PASSWORD = 'senha-boa-123';
let server;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

async function signedUpClient(email) {
  const client = server.createClient();
  const res = await client.post('/api/auth/signup', { body: { email, password: PASSWORD } });
  assert.equal(res.status, 201);
  return client;
}

test('POST /api/auth/signup cria a conta e abre a sessão com cookie HttpOnly e SameSite=Lax', async () => {
  const client = server.createClient();
  const res = await client.post('/api/auth/signup', { body: { email: 'Signup@Exemplo.com', password: PASSWORD } });
  assert.equal(res.status, 201);
  assert.equal(res.body.organizer.email, 'signup@exemplo.com');
  const cookie = res.setCookie.find((header) => header.startsWith('sid='));
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//);
});

test('POST /api/auth/signup responde 400 com dados inválidos e 409 com e-mail repetido', async () => {
  const client = server.createClient();
  const invalid = await client.post('/api/auth/signup', { body: { email: 'x', password: PASSWORD } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  assert.equal(invalid.body.error.field, 'email');

  await signedUpClient('repetido@exemplo.com');
  const repeated = await client.post('/api/auth/signup', { body: { email: 'repetido@exemplo.com', password: PASSWORD } });
  assert.equal(repeated.status, 409);
  assert.equal(repeated.body.error.code, 'EMAIL_TAKEN');
});

test('POST /api/auth/login responde 200 com sessão e 401 com senha errada', async () => {
  await signedUpClient('login@exemplo.com');
  const client = server.createClient();

  const wrong = await client.post('/api/auth/login', { body: { email: 'login@exemplo.com', password: 'errada-123' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS');
  assert.equal(wrong.body.error.message, 'E-mail ou senha incorretos.');

  const ok = await client.post('/api/auth/login', { body: { email: 'login@exemplo.com', password: PASSWORD } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.organizer.email, 'login@exemplo.com');
  assert.ok(client.cookie);
});

test('POST /api/auth/login responde 429 LOGIN_LOCKED depois de 5 falhas', async () => {
  const client = server.createClient();
  for (let i = 0; i < 5; i++) {
    await client.post('/api/auth/login', { body: { email: 'bloqueio@exemplo.com', password: 'errada-123' } });
  }
  const res = await client.post('/api/auth/login', { body: { email: 'bloqueio@exemplo.com', password: 'errada-123' } });
  assert.equal(res.status, 429);
  assert.equal(res.body.error.code, 'LOGIN_LOCKED');
  // Relógio real: entre a 5ª falha e esta tentativa passa um instante.
  assert.ok(res.body.error.retryAfterSeconds > 880 && res.body.error.retryAfterSeconds <= 900);
});

test('GET /api/auth/me responde 200 com sessão e 401 sem', async () => {
  const client = await signedUpClient('me@exemplo.com');
  const me = await client.get('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.organizer.email, 'me@exemplo.com');

  const anonymous = await server.createClient().get('/api/auth/me');
  assert.equal(anonymous.status, 401);
  assert.equal(anonymous.body.error.code, 'UNAUTHENTICATED');
});

test('POST /api/auth/logout responde 204, apaga o cookie e encerra a sessão', async () => {
  const client = await signedUpClient('logout@exemplo.com');
  const res = await client.post('/api/auth/logout', { body: {} });
  assert.equal(res.status, 204);
  assert.equal(client.cookie, null);

  const again = await client.post('/api/auth/logout', { body: {} });
  assert.equal(again.status, 401);
});

test('POST /api/auth/password-reset/request responde 202 com ou sem conta', async () => {
  await signedUpClient('reset@exemplo.com');
  const client = server.createClient();
  const before = server.sentMails.length;

  const existing = await client.post('/api/auth/password-reset/request', { body: { email: 'reset@exemplo.com' } });
  const missing = await client.post('/api/auth/password-reset/request', { body: { email: 'sem-conta@exemplo.com' } });
  assert.equal(existing.status, 202);
  assert.equal(missing.status, 202);
  assert.equal(existing.body.message, missing.body.message);
  assert.equal(server.sentMails.length, before + 1);
});

test('POST /api/auth/password-reset/confirm responde 204 com link válido e 400 com link inválido', async () => {
  await signedUpClient('confirma@exemplo.com');
  const client = server.createClient();
  await client.post('/api/auth/password-reset/request', { body: { email: 'confirma@exemplo.com' } });
  const token = decodeURIComponent(server.sentMails.at(-1).link.split('token=')[1]);

  const ok = await client.post('/api/auth/password-reset/confirm', { body: { token, password: 'senha-nova-123' } });
  assert.equal(ok.status, 204);

  const reused = await client.post('/api/auth/password-reset/confirm', { body: { token, password: 'senha-nova-456' } });
  assert.equal(reused.status, 400);
  assert.equal(reused.body.error.code, 'INVALID_RESET_TOKEN');
});
