import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createProfileService } from '../../src/services/profileService.js';
import { createClock, createTestDb, expectCode, insertOrganizer } from './testDb.js';

let db;
let profiles;
let organizer;

// 12h de 8/11/2026 em Brasília.
const NOON_IN_BRASILIA = '2026-11-08T15:00:00.000Z';

function useClock(start) {
  const clock = createClock(start);
  profiles = createProfileService({ db, now: clock.now });
  return clock;
}

beforeEach(async () => {
  db = await createTestDb();
  useClock(NOON_IN_BRASILIA);
  organizer = await insertOrganizer(db);
});

const VALID = { nickname: 'Pedrinho', birthDate: '1998-04-12', position: 'ATA', foot: 'right' };
const save = (changes = {}, organizerId = organizer.id) => profiles.saveProfile(organizerId, { ...VALID, ...changes });
const invalidField = (field, message) => (error) =>
  expectCode('VALIDATION_ERROR')(error) && error.field === field && (message === undefined || error.message === message);

test('getProfile devolve null para uma conta sem perfil', async () => {
  assert.equal(await profiles.getProfile(organizer.id), null);
});

test('saveProfile tira os espaços do apelido, grava e devolve a idade calculada', async () => {
  const profile = await save({ nickname: '  Pedrinho  ' });
  assert.deepEqual(profile, { nickname: 'Pedrinho', birthDate: '1998-04-12', age: 28, position: 'ATA', foot: 'right' });
  assert.deepEqual(await profiles.getProfile(organizer.id), profile);
});

test('saveProfile aceita as duas posições e as três pernas', async () => {
  for (const position of ['ATA', 'DEF']) {
    for (const foot of ['right', 'left', 'both']) {
      const profile = await save({ position, foot });
      assert.equal(profile.position, position);
      assert.equal(profile.foot, foot);
    }
  }
});

test('apelido vazio, só com espaços ou com mais de 40 caracteres é recusado (FR-002)', async () => {
  for (const nickname of [undefined, '', '   ', 42]) {
    await assert.rejects(save({ nickname }), invalidField('nickname', 'Informe o apelido.'));
  }
  await assert.rejects(save({ nickname: 'x'.repeat(41) }), invalidField('nickname', 'O apelido pode ter no máximo 40 caracteres.'));
  assert.equal((await save({ nickname: 'x'.repeat(40) })).nickname.length, 40);
});

test('data de nascimento ausente, fora do formato ou que não existe é recusada (FR-003)', async () => {
  for (const birthDate of [undefined, null, '']) {
    await assert.rejects(save({ birthDate }), invalidField('birthDate', 'Informe a data de nascimento.'));
  }
  for (const birthDate of ['12/04/1998', '1998-02-30', 'ontem', 19980412]) {
    await assert.rejects(save({ birthDate }), invalidField('birthDate', 'Data de nascimento inválida.'));
  }
});

test('data no futuro é recusada, contando o dia de hoje em Brasília (FR-003 e FR-005)', async () => {
  // 22h de 8/11 em Brasília, já 9/11 em UTC.
  useClock('2026-11-09T01:00:00.000Z');
  await assert.rejects(save({ birthDate: '2026-11-09' }), invalidField('birthDate', 'A data de nascimento não pode ser no futuro.'));
});

test('a idade precisa ficar entre 5 e 100 anos, com os dois limites aceitos (FR-003)', async () => {
  const outOfRange = 'Confira a data: a idade precisa ficar entre 5 e 100 anos.';
  assert.equal((await save({ birthDate: '2021-11-08' })).age, 5);
  await assert.rejects(save({ birthDate: '2021-11-09' }), invalidField('birthDate', outOfRange));
  assert.equal((await save({ birthDate: '1925-11-09' })).age, 100);
  await assert.rejects(save({ birthDate: '1925-11-08' }), invalidField('birthDate', outOfRange));
});

test('posição e perna fora da lista são recusadas (FR-004)', async () => {
  for (const position of [undefined, 'GOL', 'ata']) {
    await assert.rejects(save({ position }), invalidField('position', 'Escolha a posição.'));
  }
  for (const foot of [undefined, 'Direita', 'ambas']) {
    await assert.rejects(save({ foot }), invalidField('foot', 'Escolha a perna dominante.'));
  }
});

test('os erros vêm um por vez, na ordem do formulário', async () => {
  await assert.rejects(profiles.saveProfile(organizer.id, {}), invalidField('nickname'));
  await assert.rejects(profiles.saveProfile(organizer.id, { nickname: 'Pedrinho' }), invalidField('birthDate'));
  await assert.rejects(profiles.saveProfile(organizer.id, { nickname: 'Pedrinho', birthDate: '1998-04-12' }), invalidField('position'));
  await assert.rejects(
    profiles.saveProfile(organizer.id, { nickname: 'Pedrinho', birthDate: '1998-04-12', position: 'DEF' }),
    invalidField('foot'),
  );
});

test('salvar de novo substitui o perfil, e um pedido com erro não muda nada (FR-006)', async () => {
  await save();
  const changed = await save({ nickname: 'Pedro', birthDate: '2000-01-01', position: 'DEF', foot: 'both' });
  assert.deepEqual(changed, { nickname: 'Pedro', birthDate: '2000-01-01', age: 26, position: 'DEF', foot: 'both' });

  await assert.rejects(save({ nickname: 'Outro', foot: 'x' }), invalidField('foot'));
  assert.deepEqual(await profiles.getProfile(organizer.id), changed);
  assert.equal((await db.one('SELECT COUNT(*)::int AS count FROM profiles')).count, 1);
});

test('dois salvamentos ao mesmo tempo deixam um perfil só, com um dos dois', async () => {
  await Promise.all([save({ nickname: 'Primeiro' }), save({ nickname: 'Segundo' })]);
  assert.equal((await db.one('SELECT COUNT(*)::int AS count FROM profiles')).count, 1);
  assert.ok(['Primeiro', 'Segundo'].includes((await profiles.getProfile(organizer.id)).nickname));
});

test('a idade muda sozinha à meia-noite do aniversário em Brasília (FR-005)', async () => {
  // 23h de 11/04/2027 em Brasília.
  const clock = useClock('2027-04-12T02:00:00.000Z');
  assert.equal((await save()).age, 28);
  clock.advanceMinutes(60);
  assert.equal((await profiles.getProfile(organizer.id)).age, 29);
});

test('cada conta vê e altera só o próprio perfil (FR-007)', async () => {
  const other = await insertOrganizer(db, 'outro@exemplo.com');
  await save();
  assert.equal(await profiles.getProfile(other.id), null);

  await save({ nickname: 'Juca' }, other.id);
  assert.equal((await profiles.getProfile(organizer.id)).nickname, 'Pedrinho');
  assert.equal((await profiles.getProfile(other.id)).nickname, 'Juca');
});
