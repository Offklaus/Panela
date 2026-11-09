import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './testServer.js';

let server;
let counter = 0;

// 12h de 8/11/2026 em Brasília: quem nasceu em 12/04/1998 tem 28 anos.
before(async () => {
  server = await startTestServer({ now: () => new Date('2026-11-08T15:00:00.000Z') });
});

after(() => server.close());

async function newOrganizer() {
  const client = server.createClient();
  counter += 1;
  const res = await client.post('/api/auth/signup', { body: { email: `craque${counter}@exemplo.com`, password: 'senha-boa-123' } });
  assert.equal(res.status, 201);
  return client;
}

const VALID = { nickname: 'Pedrinho', birthDate: '1998-04-12', position: 'ATA', foot: 'right' };

test('as rotas do perfil exigem sessão', async () => {
  const anonymous = server.createClient();
  for (const [method, options] of [['get'], ['put', { body: VALID }]]) {
    const res = await anonymous[method]('/api/profile', options);
    assert.equal(res.status, 401, method);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  }
});

test('GET /api/profile de uma conta nova devolve profile null', async () => {
  const client = await newOrganizer();
  const res = await client.get('/api/profile');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { profile: null });
});

test('PUT /api/profile grava o perfil e GET devolve com a idade', async () => {
  const client = await newOrganizer();
  const saved = await client.put('/api/profile', { body: { ...VALID, nickname: ' Pedrinho ', age: 99 } });
  assert.equal(saved.status, 200);
  const expected = { profile: { nickname: 'Pedrinho', birthDate: '1998-04-12', age: 28, position: 'ATA', foot: 'right' } };
  assert.deepEqual(saved.body, expected);
  assert.deepEqual((await client.get('/api/profile')).body, expected);

  const changed = await client.put('/api/profile', { body: { ...VALID, foot: 'both' } });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.profile.foot, 'both');
});

test('PUT /api/profile responde 400 com o campo do erro e não grava', async () => {
  const client = await newOrganizer();
  const noNickname = await client.put('/api/profile', { body: { ...VALID, nickname: '  ' } });
  assert.equal(noNickname.status, 400);
  assert.deepEqual(noNickname.body.error, { code: 'VALIDATION_ERROR', message: 'Informe o apelido.', field: 'nickname' });

  const future = await client.put('/api/profile', { body: { ...VALID, birthDate: '2026-12-01' } });
  assert.equal(future.status, 400);
  assert.deepEqual(future.body.error, {
    code: 'VALIDATION_ERROR',
    message: 'A data de nascimento não pode ser no futuro.',
    field: 'birthDate',
  });

  const badFoot = await client.put('/api/profile', { body: { ...VALID, foot: 'canhota' } });
  assert.equal(badFoot.status, 400);
  assert.deepEqual(badFoot.body.error, { code: 'VALIDATION_ERROR', message: 'Escolha a perna dominante.', field: 'foot' });

  assert.deepEqual((await client.get('/api/profile')).body, { profile: null });
});

test('cada conta vê só o próprio perfil', async () => {
  const first = await newOrganizer();
  const second = await newOrganizer();
  await first.put('/api/profile', { body: VALID });
  assert.deepEqual((await second.get('/api/profile')).body, { profile: null });
});
