import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDrawService } from '../../src/services/drawService.js';
import { createRosterService } from '../../src/services/rosterService.js';
import { createSeededRng } from '../../src/utils/random.js';
import { createClock, createTestDb, insertClub, insertOrganizerWithClub } from './testDb.js';

let db;
let clock;
let roster;
let draws;
let organizer;

beforeEach(async () => {
  db = await createTestDb();
  clock = createClock();
  roster = createRosterService({ db, now: clock.now });
  draws = createDrawService({ db, rng: createSeededRng(7), now: clock.now });
  organizer = await insertOrganizerWithClub(db);
});

async function addPlayers(ratings) {
  let state;
  for (const [index, rating] of ratings.entries()) {
    state = await roster.addPlayer(organizer.id, { name: `Jogador ${String(index + 1).padStart(2, '0')}`, rating, position: index % 2 === 0 ? 'ATA' : 'DEF' });
  }
  return state.players;
}

const idsIn = (draw) => [...draw.teams.flatMap((team) => team.players.map((player) => player.id)), ...draw.bench.map((player) => player.id)];

// US4 - sorteio

test('getDraw devolve null antes do primeiro sorteio', async () => {
  assert.equal(await draws.getDraw(organizer.id), null);
});

test('createDraw usa só os presentes, guarda times e banco e começa atualizado', async () => {
  const players = await addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5, 1]);
  await roster.updatePlayer(organizer.id, players[11].id, { present: false });

  const draw = await draws.createDraw(organizer.id);
  assert.equal(draw.teams.length, 2);
  assert.equal(draw.bench.length, 1);
  assert.equal(idsIn(draw).length, 11);
  assert.ok(!idsIn(draw).includes(players[11].id));
  assert.equal(draw.stale, false);
  assert.equal(draw.createdAt, '2026-11-01T12:00:00.000Z');
  assert.deepEqual(await draws.getDraw(organizer.id), draw);
});

test('times com letras, coletes em ordem, jogadores do maior para o menor nível, total, média e diferença', async () => {
  await addPlayers([5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1]);
  const draw = await draws.createDraw(organizer.id);

  assert.deepEqual(draw.teams.map((team) => team.letter), ['A', 'B', 'C']);
  assert.deepEqual(draw.teams.map((team) => team.vest), ['green', 'white', 'orange']);
  assert.equal(draw.teamSize, 5);
  assert.equal(draw.missingPlayers, 0);

  for (const team of draw.teams) {
    const ratings = team.players.map((player) => player.rating);
    assert.deepEqual(ratings, [...ratings].sort((a, b) => b - a));
    assert.equal(team.total, ratings.reduce((sum, rating) => sum + rating, 0));
    assert.equal(team.average, team.total / 5);
  }
  const totals = draw.teams.map((team) => team.total);
  assert.equal(draw.difference, Math.max(...totals) - Math.min(...totals));
});

test('os coletes voltam ao início depois do oitavo time', async () => {
  await addPlayers(Array(45).fill(3));
  const draw = await draws.createDraw(organizer.id);
  assert.equal(draw.teams.length, 9);
  assert.equal(draw.teams[8].letter, 'I');
  assert.equal(draw.teams[8].vest, 'green');
});

test('com 9 presentes não há times, todos aguardam e falta 1 jogador', async () => {
  await addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3]);
  const draw = await draws.createDraw(organizer.id);
  assert.deepEqual(draw.teams, []);
  assert.equal(draw.bench.length, 9);
  assert.equal(draw.missingPlayers, 1);
  assert.equal(draw.difference, null);
});

test('um novo sorteio substitui o anterior', async () => {
  await addPlayers(Array(11).fill(3));
  await draws.createDraw(organizer.id);
  clock.advanceMinutes(5);
  const second = await draws.createDraw(organizer.id);
  assert.equal(second.createdAt, '2026-11-01T12:05:00.000Z');
  assert.equal((await db.one('SELECT COUNT(*)::int AS count FROM draws')).count, 1);
});

// US5 - lista alterada depois do sorteio

test('jogador removido some dos times e do banco e os totais são recalculados (FR-032)', async () => {
  await addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5]);
  const before = await draws.createDraw(organizer.id);
  const removed = before.teams[0].players[0];

  await roster.removePlayer(organizer.id, removed.id);
  const after = await draws.getDraw(organizer.id);

  assert.ok(!idsIn(after).includes(removed.id));
  assert.equal(after.teams[0].players.length, 4);
  assert.equal(after.teams[0].total, before.teams[0].total - removed.rating);
});

test('alterar o elenco deixa o sorteio desatualizado e um novo sorteio zera o aviso (FR-031, FR-033)', async () => {
  const players = await addPlayers(Array(11).fill(3));
  await draws.createDraw(organizer.id);

  await roster.updatePlayer(organizer.id, players[0].id, { present: false });
  assert.equal((await draws.getDraw(organizer.id)).stale, true);

  assert.equal((await draws.createDraw(organizer.id)).stale, false);
});

// Feature 003 - posição

test('o sorteio traz a posição dos jogadores, as contagens por time e positionShortage nulo', async () => {
  await addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5]);
  const draw = await draws.createDraw(organizer.id);
  for (const team of draw.teams) {
    assert.equal(team.positions.ATA + team.positions.DEF, 5);
    assert.ok(team.players.every((player) => player.position === 'ATA' || player.position === 'DEF'));
  }
  assert.ok(draw.bench.every((player) => player.position === 'ATA' || player.position === 'DEF'));
  assert.equal(draw.positionShortage, null);
});
const insertWithoutPosition = (name) =>
  db.run('INSERT INTO players (organizer_id, name, name_key, rating, created_at) VALUES ($1, $2, $3, 3, now())', [
    organizer.id,
    name,
    name.toLowerCase(),
  ]);

test('com 10 ou mais presentes e algum sem posição, o sorteio é bloqueado e o anterior continua (FR-007 da 003)', async () => {
  await addPlayers(Array(11).fill(3));
  const previous = await draws.createDraw(organizer.id);
  await insertWithoutPosition('Antigo 1');
  await insertWithoutPosition('Antigo 2');
  await assert.rejects(
    draws.createDraw(organizer.id),
    (error) =>
      error.status === 409 &&
      error.code === 'POSITIONS_MISSING' &&
      error.message === 'Defina a posição de 2 presentes para sortear.' &&
      error.extra.missingPositions === 2,
  );
  assert.deepEqual(await draws.getDraw(organizer.id), previous);
});

test('com menos de 10 presentes, a posição não é cobrada e o sorteio sai sem times (FR-009 da 003)', async () => {
  await addPlayers(Array(8).fill(3));
  await insertWithoutPosition('Antigo');
  const draw = await draws.createDraw(organizer.id);
  assert.deepEqual(draw.teams, []);
  assert.equal(draw.missingPlayers, 1);
});

// Feature 005 - sorteio só com time

test('sem time, getDraw devolve null, createDraw é recusado e o sorteio antigo volta com o time (FR-018 da 005)', async () => {
  await addPlayers(Array(11).fill(3));
  const previous = await draws.createDraw(organizer.id);
  // Como uma conta da feature 004: jogadores e sorteio guardados, sem time.
  await db.run('DELETE FROM clubs WHERE organizer_id = $1', [organizer.id]);

  assert.equal(await draws.getDraw(organizer.id), null);
  await assert.rejects(
    draws.createDraw(organizer.id),
    (error) => error.status === 409 && error.code === 'CLUB_REQUIRED' && error.message === 'Crie o seu time no MyTeam primeiro.',
  );

  await insertClub(db, organizer.id);
  assert.deepEqual(await draws.getDraw(organizer.id), previous);
});

test('com 9 ATA e 1 DEF, positionShortage aponta o defensor em falta (FR-017 da 003)', async () => {
  for (let i = 1; i <= 10; i++) {
    await roster.addPlayer(organizer.id, { name: `J${i}`, rating: 3, position: i === 1 ? 'DEF' : 'ATA' });
  }
  const draw = await draws.createDraw(organizer.id);
  assert.deepEqual(draw.positionShortage, { position: 'DEF', count: 1, teams: 2 });
});