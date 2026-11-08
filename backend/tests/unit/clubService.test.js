import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { CLUB_ICONS } from '../../src/config/domain.js';
import { createClubService, hasClub, requireClub } from '../../src/services/clubService.js';
import { createClock, createTestDb, expectCode, insertOrganizer } from './testDb.js';

let db;
let clubs;
let organizer;

beforeEach(async () => {
  db = await createTestDb();
  clubs = createClubService({ db, now: createClock().now });
  organizer = await insertOrganizer(db);
});

const invalidField = (field) => (error) => expectCode('VALIDATION_ERROR')(error) && error.field === field;

test('getClub devolve null para uma conta sem time', async () => {
  assert.equal(await clubs.getClub(organizer.id), null);
});

test('hasClub e requireClub dizem se a conta tem time (FR-018)', async () => {
  assert.equal(await hasClub(db, organizer.id), false);
  await assert.rejects(
    requireClub(db, organizer.id),
    (error) => error.status === 409 && error.code === 'CLUB_REQUIRED' && error.message === 'Crie o seu time no MyTeam primeiro.',
  );
  await clubs.createClub(organizer.id, { name: 'Os Boleiros' });
  assert.equal(await hasClub(db, organizer.id), true);
  await requireClub(db, organizer.id);
});

test('createClub tira espaços das pontas, grava o ícone e getClub devolve o time', async () => {
  const club = await clubs.createClub(organizer.id, { name: '  Os Boleiros  ', icon: 'shield' });
  assert.deepEqual(club, { name: 'Os Boleiros', icon: 'shield' });
  assert.deepEqual(await clubs.getClub(organizer.id), { name: 'Os Boleiros', icon: 'shield' });
});

test('createClub usa a bola quando o ícone não vem', async () => {
  assert.equal((await clubs.createClub(organizer.id, { name: 'Sem ícone' })).icon, 'ball');
});

test('createClub aceita cada ícone da lista', async () => {
  for (const [index, icon] of CLUB_ICONS.entries()) {
    const other = await insertOrganizer(db, `icone${index}@exemplo.com`);
    assert.equal((await clubs.createClub(other.id, { name: 'Time', icon })).icon, icon);
  }
});

test('createClub recusa nome vazio, só com espaços, que não é texto ou com mais de 40 caracteres', async () => {
  for (const name of ['', '   ', undefined, 42, 'x'.repeat(41)]) {
    await assert.rejects(clubs.createClub(organizer.id, { name, icon: 'ball' }), invalidField('name'));
  }
  assert.equal(await clubs.getClub(organizer.id), null);
  assert.equal((await clubs.createClub(organizer.id, { name: 'x'.repeat(40) })).name.length, 40);
});

test('createClub recusa ícone fora da lista', async () => {
  for (const icon of ['logo', '', null, 1, 'BALL']) {
    await assert.rejects(clubs.createClub(organizer.id, { name: 'Os Boleiros', icon }), invalidField('icon'));
  }
  assert.equal(await clubs.getClub(organizer.id), null);
});

test('a conta tem no máximo um time: criar de novo dá CLUB_EXISTS e não muda o time', async () => {
  await clubs.createClub(organizer.id, { name: 'Os Boleiros', icon: 'shield' });
  await assert.rejects(clubs.createClub(organizer.id, { name: 'Outro', icon: 'star' }), expectCode('CLUB_EXISTS'));
  assert.deepEqual(await clubs.getClub(organizer.id), { name: 'Os Boleiros', icon: 'shield' });
});

test('dois pedidos ao mesmo tempo criam um time só', async () => {
  const results = await Promise.allSettled([
    clubs.createClub(organizer.id, { name: 'Primeiro' }),
    clubs.createClub(organizer.id, { name: 'Segundo' }),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.find((result) => result.status === 'rejected').reason.code, 'CLUB_EXISTS');
  const [{ count }] = await db.query('SELECT COUNT(*)::int AS count FROM clubs');
  assert.equal(count, 1);
});

test('o time de uma conta não aparece para outra', async () => {
  const other = await insertOrganizer(db, 'outro@exemplo.com');
  await clubs.createClub(organizer.id, { name: 'Os Boleiros' });
  assert.equal(await clubs.getClub(other.id), null);
  assert.deepEqual(await clubs.createClub(other.id, { name: 'Os Boleiros', icon: 'star' }), { name: 'Os Boleiros', icon: 'star' });
});