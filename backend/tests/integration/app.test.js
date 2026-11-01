import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './testServer.js';

let server;
let client;

before(async () => {
  server = await startTestServer();
  client = server.createClient();
});

after(() => server.close());

test('rota desconhecida da API responde 404 NOT_FOUND em JSON', async () => {
  const res = await client.get('/api/nao-existe');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

test('POST sem Content-Type JSON responde 415 UNSUPPORTED_MEDIA_TYPE', async () => {
  const res = await client.post('/api/qualquer', {
    body: 'a=1',
    json: false,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });
  assert.equal(res.status, 415);
  assert.equal(res.body.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('JSON malformado responde 400 INVALID_JSON', async () => {
  const res = await client.post('/api/qualquer', { body: '{"a":' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_JSON');
});

test('respostas trazem cabeçalhos de segurança', async () => {
  const res = await client.get('/api/nao-existe');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(res.headers.get('content-security-policy'));
});
