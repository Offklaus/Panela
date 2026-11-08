import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './testServer.js';

let server;
let counter = 0;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

async function organizerWithPlayers(count) {
  const client = server.createClient();
  counter += 1;
  await client.post('/api/auth/signup', { body: { email: `sorteio${counter}@exemplo.com`, password: 'senha-boa-123' } });
  // O sorteio é do time: sem ele, a rota recusa sortear (FR-018 da 005).
  assert.equal((await client.post('/api/club', { body: { name: 'Os Boleiros' } })).status, 201);
  for (let i = 1; i <= count; i++) {
    const res = await client.post('/api/players', { body: { name: `Jogador ${i}`, rating: (i % 5) + 1, position: i % 2 === 0 ? 'ATA' : 'DEF' } });
    assert.equal(res.status, 201);
  }
  return client;
}

// US4 - sorteio

test('as rotas do sorteio exigem sessão', async () => {
  const anonymous = server.createClient();
  assert.equal((await anonymous.get('/api/draw')).status, 401);
  assert.equal((await anonymous.post('/api/draw', { body: {} })).status, 401);
});

test('GET /api/draw devolve null antes do primeiro sorteio e o sorteio salvo depois', async () => {
  const client = await organizerWithPlayers(11);
  assert.deepEqual((await client.get('/api/draw')).body, { draw: null });

  const created = await client.post('/api/draw', { body: {} });
  const saved = await client.get('/api/draw');
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.body.draw, created.body.draw);
});

test('POST /api/draw com 11 presentes responde 201 com 2 times de 5 e 1 no banco', async () => {
  const client = await organizerWithPlayers(11);
  const res = await client.post('/api/draw', { body: {} });
  assert.equal(res.status, 201);
  const { draw } = res.body;
  assert.equal(draw.teams.length, 2);
  assert.ok(draw.teams.every((team) => team.players.length === 5));
  assert.equal(draw.bench.length, 1);
  assert.equal(draw.missingPlayers, 0);
  assert.equal(typeof draw.difference, 'number');
});

test('POST /api/draw com 9 presentes não forma times e informa que falta 1', async () => {
  const client = await organizerWithPlayers(9);
  const { draw } = (await client.post('/api/draw', { body: {} })).body;
  assert.deepEqual(draw.teams, []);
  assert.equal(draw.missingPlayers, 1);
  assert.equal(draw.bench.length, 9);
});

test('um organizador nunca vê o sorteio de outro', async () => {
  const owner = await organizerWithPlayers(10);
  await owner.post('/api/draw', { body: {} });
  const other = await organizerWithPlayers(0);
  assert.deepEqual((await other.get('/api/draw')).body, { draw: null });
});

// US5 - lista alterada depois do sorteio

test('mudar a presença deixa o sorteio desatualizado com os mesmos times; sortear de novo zera o aviso', async () => {
  const client = await organizerWithPlayers(11);
  const { draw } = (await client.post('/api/draw', { body: {} })).body;
  const someone = draw.teams[0].players[0];

  const changed = await client.patch(`/api/players/${someone.id}`, { body: { present: false } });
  assert.equal(changed.body.drawStale, true);

  const stale = (await client.get('/api/draw')).body.draw;
  assert.equal(stale.stale, true);
  assert.deepEqual(
    stale.teams.map((team) => team.players.map((player) => player.id)),
    draw.teams.map((team) => team.players.map((player) => player.id)),
  );

  const fresh = (await client.post('/api/draw', { body: {} })).body.draw;
  assert.equal(fresh.stale, false);
  assert.equal((await client.get('/api/roster')).body.drawStale, false);
});

// Feature 003 - posição

test('POST /api/draw devolve times com contagem de posições e jogadores com posição', async () => {
  const client = await organizerWithPlayers(10);
  const { status, body } = await client.post('/api/draw', { body: {} });
  assert.equal(status, 201);
  assert.deepEqual(body.draw.teams.map((team) => team.positions.ATA).sort(), [2, 3]);
  for (const team of body.draw.teams) {
    assert.equal(team.positions.ATA + team.positions.DEF, 5);
    assert.ok(team.players.every((player) => ['ATA', 'DEF'].includes(player.position)));
  }
});
test('POST /api/draw com presente sem posição responde 409 POSITIONS_MISSING', async () => {
  const client = await organizerWithPlayers(10);
  const { body } = await client.get('/api/auth/me');
  await server.db.run(
    "INSERT INTO players (organizer_id, name, name_key, rating, created_at) VALUES ($1, 'Antigo', 'antigo', 3, now())",
    [body.organizer.id],
  );
  const res = await client.post('/api/draw', { body: {} });
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'POSITIONS_MISSING');
  assert.equal(res.body.error.missingPositions, 1);
});