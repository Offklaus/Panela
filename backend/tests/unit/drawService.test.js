import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDrawService } from '../../src/services/drawService.js';
import { createRosterService } from '../../src/services/rosterService.js';
import { createSeededRng } from '../../src/utils/random.js';
import { createClock, createTestDb, insertOrganizer } from './testDb.js';

let db;
let clock;
let roster;
let draws;
let organizer;

beforeEach(() => {
  db = createTestDb();
  clock = createClock();
  roster = createRosterService({ db, now: clock.now });
  draws = createDrawService({ db, rng: createSeededRng(7), now: clock.now });
  organizer = insertOrganizer(db);
});

function addPlayers(ratings) {
  let state;
  ratings.forEach((rating, index) => {
    state = roster.addPlayer(organizer.id, { name: `Jogador ${String(index + 1).padStart(2, '0')}`, rating });
  });
  return state.players;
}

const idsIn = (draw) => [...draw.teams.flatMap((team) => team.players.map((player) => player.id)), ...draw.bench.map((player) => player.id)];

// US4 - sorteio

test('getDraw devolve null antes do primeiro sorteio', () => {
  assert.equal(draws.getDraw(organizer.id), null);
});

test('createDraw usa só os presentes, guarda times e banco e começa atualizado', () => {
  const players = addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5, 1]);
  roster.updatePlayer(organizer.id, players[11].id, { present: false });

  const draw = draws.createDraw(organizer.id);
  assert.equal(draw.teams.length, 2);
  assert.equal(draw.bench.length, 1);
  assert.equal(idsIn(draw).length, 11);
  assert.ok(!idsIn(draw).includes(players[11].id));
  assert.equal(draw.stale, false);
  assert.equal(draw.createdAt, '2026-11-01T12:00:00.000Z');
  assert.deepEqual(draws.getDraw(organizer.id), draw);
});

test('times com letras, coletes em ordem, jogadores do maior para o menor nível, total, média e diferença', () => {
  addPlayers([5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1]);
  const draw = draws.createDraw(organizer.id);

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

test('os coletes voltam ao início depois do oitavo time', () => {
  addPlayers(Array(45).fill(3));
  const draw = draws.createDraw(organizer.id);
  assert.equal(draw.teams.length, 9);
  assert.equal(draw.teams[8].letter, 'I');
  assert.equal(draw.teams[8].vest, 'green');
});

test('com 9 presentes não há times, todos aguardam e falta 1 jogador', () => {
  addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3]);
  const draw = draws.createDraw(organizer.id);
  assert.deepEqual(draw.teams, []);
  assert.equal(draw.bench.length, 9);
  assert.equal(draw.missingPlayers, 1);
  assert.equal(draw.difference, null);
});

test('um novo sorteio substitui o anterior', () => {
  addPlayers(Array(11).fill(3));
  draws.createDraw(organizer.id);
  clock.advanceMinutes(5);
  const second = draws.createDraw(organizer.id);
  assert.equal(second.createdAt, '2026-11-01T12:05:00.000Z');
  assert.equal(db.prepare('SELECT COUNT(*) FROM draws').pluck().get(), 1);
});

// US5 - lista alterada depois do sorteio

test('jogador removido some dos times e do banco e os totais são recalculados (FR-032)', () => {
  addPlayers([5, 4, 4, 3, 3, 3, 2, 4, 3, 2, 5]);
  const before = draws.createDraw(organizer.id);
  const removed = before.teams[0].players[0];

  roster.removePlayer(organizer.id, removed.id);
  const after = draws.getDraw(organizer.id);

  assert.ok(!idsIn(after).includes(removed.id));
  assert.equal(after.teams[0].players.length, 4);
  assert.equal(after.teams[0].total, before.teams[0].total - removed.rating);
});

test('alterar o elenco deixa o sorteio desatualizado e um novo sorteio zera o aviso (FR-031, FR-033)', () => {
  const players = addPlayers(Array(11).fill(3));
  draws.createDraw(organizer.id);

  roster.updatePlayer(organizer.id, players[0].id, { present: false });
  assert.equal(draws.getDraw(organizer.id).stale, true);

  assert.equal(draws.createDraw(organizer.id).stale, false);
});
