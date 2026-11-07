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
  const res = await client.post('/api/auth/signup', { body: { email: `org${counter}@exemplo.com`, password: 'senha-boa-123' } });
  assert.equal(res.status, 201);
  return client;
}

// US2 - elenco

test('as rotas do elenco exigem sessão', async () => {
  const anonymous = server.createClient();
  const calls = [
    ['get', '/api/roster'],
    ['post', '/api/players', { body: { name: 'A', rating: 3, position: 'ATA' } }],
    ['patch', '/api/players/1', { body: { rating: 2 } }],
    ['delete', '/api/players/1'],
    ['put', '/api/players/presence', { body: { present: true } }],
  ];
  for (const [method, path, options] of calls) {
    const res = await anonymous[method](path, options);
    assert.equal(res.status, 401, `${method} ${path}`);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  }
});

test('GET /api/roster de uma conta nova vem vazio', async () => {
  const client = await newOrganizer();
  const res = await client.get('/api/roster');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    players: [],
    summary: { presentCount: 0, possibleTeams: 0, averageRating: null },
    drawStale: false,
  });
});

test('POST /api/players responde 201 com o elenco, 400 com dados inválidos e 409 com nome repetido', async () => {
  const client = await newOrganizer();
  const created = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'ATA' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.players[0].name, 'Pedrinho');
  assert.equal(created.body.players[0].present, true);
  assert.equal(created.body.summary.presentCount, 1);

  const invalid = await client.post('/api/players', { body: { name: '  ', rating: 4, position: 'ATA' } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.field, 'name');

  const repeated = await client.post('/api/players', { body: { name: ' pedrinho ', rating: 2, position: 'ATA' } });
  assert.equal(repeated.status, 409);
  assert.equal(repeated.body.error.code, 'NAME_TAKEN');
});

test('POST /api/players responde 409 ROSTER_FULL no 101º jogador', async () => {
  const client = await newOrganizer();
  for (let i = 1; i <= 100; i++) {
    const res = await client.post('/api/players', { body: { name: `Jogador ${i}`, rating: 3, position: 'ATA' } });
    assert.equal(res.status, 201);
  }
  const res = await client.post('/api/players', { body: { name: 'Jogador 101', rating: 3, position: 'ATA' } });
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'ROSTER_FULL');
});

test('PATCH /api/players/:id muda o nível; 400 com nível inválido; 404 sem o jogador', async () => {
  const client = await newOrganizer();
  const { body } = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'ATA' } });
  const id = body.players[0].id;

  const ok = await client.patch(`/api/players/${id}`, { body: { rating: 2 } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.players[0].rating, 2);

  const invalid = await client.patch(`/api/players/${id}`, { body: { rating: 9 } });
  assert.equal(invalid.status, 400);

  const missing = await client.patch('/api/players/999999', { body: { rating: 2 } });
  assert.equal(missing.status, 404);
});

test('DELETE /api/players/:id remove o jogador; 404 se não existe', async () => {
  const client = await newOrganizer();
  const { body } = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'ATA' } });
  const id = body.players[0].id;

  const ok = await client.delete(`/api/players/${id}`);
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body.players, []);

  const again = await client.delete(`/api/players/${id}`);
  assert.equal(again.status, 404);
});

test('um organizador não vê nem altera jogadores de outro (FR-007)', async () => {
  const owner = await newOrganizer();
  const intruder = await newOrganizer();
  const { body } = await owner.post('/api/players', { body: { name: 'Do dono', rating: 5, position: 'ATA' } });
  const id = body.players[0].id;

  assert.deepEqual((await intruder.get('/api/roster')).body.players, []);
  assert.equal((await intruder.patch(`/api/players/${id}`, { body: { rating: 1 } })).status, 404);
  assert.equal((await intruder.delete(`/api/players/${id}`)).status, 404);
  assert.equal((await owner.get('/api/roster')).body.players[0].rating, 5);
});

// US3 - presença

test('PATCH /api/players/:id muda a presença; 400 com presença não booleana ou corpo vazio', async () => {
  const client = await newOrganizer();
  const { body } = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'ATA' } });
  const id = body.players[0].id;

  const ok = await client.patch(`/api/players/${id}`, { body: { present: false } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.players[0].present, false);
  assert.equal(ok.body.summary.presentCount, 0);

  assert.equal((await client.patch(`/api/players/${id}`, { body: { present: 'não' } })).status, 400);
  assert.equal((await client.patch(`/api/players/${id}`, { body: {} })).status, 400);
});

test('PUT /api/players/presence marca todos; 400 com valor inválido', async () => {
  const client = await newOrganizer();
  await client.post('/api/players', { body: { name: 'A', rating: 4, position: 'ATA' } });
  await client.post('/api/players', { body: { name: 'B', rating: 2, position: 'ATA' } });

  const cleared = await client.put('/api/players/presence', { body: { present: false } });
  assert.equal(cleared.status, 200);
  assert.equal(cleared.body.summary.presentCount, 0);

  const all = await client.put('/api/players/presence', { body: { present: true } });
  assert.equal(all.body.summary.presentCount, 2);
  assert.equal(all.body.summary.averageRating, 3);

  assert.equal((await client.put('/api/players/presence', { body: { present: 'todos' } })).status, 400);
});

// Feature 003 - posição

test('POST /api/players exige posição: 400 com field "position"; 201 com DEF', async () => {
  const client = await newOrganizer();
  const without = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4 } });
  assert.equal(without.status, 400);
  assert.equal(without.body.error.code, 'VALIDATION_ERROR');
  assert.equal(without.body.error.field, 'position');
  assert.equal(without.body.error.message, 'Escolha a posição.');

  const created = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'DEF' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.players[0].position, 'DEF');
});

test('PATCH /api/players/:id muda a posição; 400 com posição inválida', async () => {
  const client = await newOrganizer();
  const { body } = await client.post('/api/players', { body: { name: 'Pedrinho', rating: 4, position: 'DEF' } });
  const id = body.players[0].id;

  const ok = await client.patch(`/api/players/${id}`, { body: { position: 'ATA' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.players[0].position, 'ATA');

  assert.equal((await client.patch(`/api/players/${id}`, { body: { position: 'GOL' } })).status, 400);
});