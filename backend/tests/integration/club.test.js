import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './testServer.js';

let server;
let counter = 0;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

async function newOrganizer() {
  const client = server.createClient();
  counter += 1;
  const res = await client.post('/api/auth/signup', { body: { email: `clube${counter}@exemplo.com`, password: 'senha-boa-123' } });
  assert.equal(res.status, 201);
  return client;
}

test('as rotas do time exigem sessão', async () => {
  const anonymous = server.createClient();
  for (const [method, options] of [['get'], ['post', { body: { name: 'Os Boleiros' } }]]) {
    const res = await anonymous[method]('/api/club', options);
    assert.equal(res.status, 401, method);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  }
});

test('GET /api/club de uma conta nova devolve club null', async () => {
  const client = await newOrganizer();
  const res = await client.get('/api/club');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { club: null });
});

test('POST /api/club cria o time e GET /api/club passa a devolvê-lo', async () => {
  const client = await newOrganizer();
  const created = await client.post('/api/club', { body: { name: ' Os Boleiros ', icon: 'shield' } });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { club: { name: 'Os Boleiros', icon: 'shield' } });

  const res = await client.get('/api/club');
  assert.deepEqual(res.body, { club: { name: 'Os Boleiros', icon: 'shield' } });
});

test('POST /api/club responde 400 com o campo do erro', async () => {
  const client = await newOrganizer();
  const noName = await client.post('/api/club', { body: { name: '  ', icon: 'ball' } });
  assert.equal(noName.status, 400);
  assert.deepEqual(noName.body.error, { code: 'VALIDATION_ERROR', message: 'Informe o nome do time.', field: 'name' });

  const badIcon = await client.post('/api/club', { body: { name: 'Os Boleiros', icon: 'logo' } });
  assert.equal(badIcon.status, 400);
  assert.deepEqual(badIcon.body.error, { code: 'VALIDATION_ERROR', message: 'Escolha um ícone da lista.', field: 'icon' });

  assert.deepEqual((await client.get('/api/club')).body, { club: null });
});

test('POST /api/club numa conta com time responde 409 CLUB_EXISTS e mantém o time', async () => {
  const client = await newOrganizer();
  await client.post('/api/club', { body: { name: 'Os Boleiros', icon: 'shield' } });
  const again = await client.post('/api/club', { body: { name: 'Outro nome', icon: 'star' } });
  assert.equal(again.status, 409);
  assert.deepEqual(again.body.error, { code: 'CLUB_EXISTS', message: 'Você já tem um time.' });
  assert.deepEqual((await client.get('/api/club')).body, { club: { name: 'Os Boleiros', icon: 'shield' } });
});

test('cada conta vê só o próprio time', async () => {
  const first = await newOrganizer();
  const second = await newOrganizer();
  await first.post('/api/club', { body: { name: 'Os Boleiros' } });
  assert.deepEqual((await second.get('/api/club')).body, { club: null });
});

// US4 - elenco e sorteio só com time

// Jogador gravado direto no banco, como os das contas da feature 004, que ainda não têm time.
async function insertOldPlayer(client) {
  const { body } = await client.get('/api/auth/me');
  return server.db.one(
    "INSERT INTO players (organizer_id, name, name_key, rating, position, present, created_at) VALUES ($1, 'Antigo', 'antigo', 4, 'DEF', false, now()) RETURNING id",
    [body.organizer.id],
  );
}

const EMPTY_ROSTER = { players: [], summary: { presentCount: 0, possibleTeams: 0, averageRating: null }, drawStale: false };

test('sem time, GET /api/roster vem vazio e GET /api/draw vem null mesmo com jogadores na conta', async () => {
  const client = await newOrganizer();
  await insertOldPlayer(client);
  const roster = await client.get('/api/roster');
  assert.equal(roster.status, 200);
  assert.deepEqual(roster.body, EMPTY_ROSTER);
  assert.deepEqual((await client.get('/api/draw')).body, { draw: null });
});

test('sem time, mudar o elenco e sortear respondem 409 CLUB_REQUIRED e nada muda', async () => {
  const client = await newOrganizer();
  const { id } = await insertOldPlayer(client);
  const calls = [
    ['post', '/api/players', { body: { name: 'Novo', rating: 3, position: 'ATA' } }],
    ['patch', `/api/players/${id}`, { body: { present: true } }],
    ['delete', `/api/players/${id}`],
    ['put', '/api/players/presence', { body: { present: true } }],
    ['post', '/api/draw', { body: {} }],
  ];
  for (const [method, path, options] of calls) {
    const res = await client[method](path, options);
    assert.equal(res.status, 409, `${method} ${path}`);
    assert.deepEqual(res.body.error, { code: 'CLUB_REQUIRED', message: 'Crie o seu time no MyTeam primeiro.' });
  }

  const invalid = await client.post('/api/players', { body: { name: '', rating: 3, position: 'ATA' } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');

  await client.post('/api/club', { body: { name: 'Os Boleiros' } });
  const { players } = (await client.get('/api/roster')).body;
  assert.deepEqual(players, [{ id, name: 'Antigo', rating: 4, present: false, position: 'DEF' }]);
});

test('depois de criar o time, o elenco mostra os jogadores da conta e dá para sortear', async () => {
  const client = await newOrganizer();
  await insertOldPlayer(client);
  assert.equal((await client.post('/api/club', { body: { name: 'Os Boleiros' } })).status, 201);

  const presence = await client.put('/api/players/presence', { body: { present: true } });
  assert.equal(presence.status, 200);
  assert.deepEqual(presence.body.summary, { presentCount: 1, possibleTeams: 0, averageRating: 4 });

  const draw = await client.post('/api/draw', { body: {} });
  assert.equal(draw.status, 201);
  assert.equal(draw.body.draw.bench.length, 1);
});