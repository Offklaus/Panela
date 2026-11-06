import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionService } from '../../src/services/sessionService.js';
import { hashToken } from '../../src/utils/crypto.js';
import { createClock, createTestDb, insertOrganizer } from './testDb.js';

let db;
let clock;
let sessions;
let organizer;

beforeEach(async () => {
  db = await createTestDb();
  clock = createClock();
  sessions = createSessionService({ db, now: clock.now });
  organizer = await insertOrganizer(db);
});

const countSessions = async () => (await db.one('SELECT COUNT(*)::int AS count FROM sessions')).count;

test('createSession guarda só o hash do token e vale 30 dias', async () => {
  const { token } = await sessions.createSession(organizer.id);
  const row = await db.one('SELECT token_hash, expires_at FROM sessions');
  assert.notEqual(row.token_hash, token);
  assert.equal(row.token_hash, hashToken(token));
  assert.equal(row.expires_at.toISOString(), '2026-12-01T12:00:00.000Z');
});

test('resolveSession devolve o organizador da sessão', async () => {
  const { token } = await sessions.createSession(organizer.id);
  assert.deepEqual(await sessions.resolveSession(token), { id: organizer.id, email: organizer.email });
});

test('sessão vencida vira null e é apagada', async () => {
  const { token } = await sessions.createSession(organizer.id);
  clock.advanceDays(30);
  assert.equal(await sessions.resolveSession(token), null);
  assert.equal(await countSessions(), 0);
});

test('token vazio ou desconhecido devolve null', async () => {
  assert.equal(await sessions.resolveSession(undefined), null);
  assert.equal(await sessions.resolveSession('desconhecido'), null);
});

test('endSession apaga a sessão', async () => {
  const { token } = await sessions.createSession(organizer.id);
  await sessions.endSession(token);
  assert.equal(await sessions.resolveSession(token), null);
});

test('endAllSessions apaga todas as sessões do organizador e só dele', async () => {
  const other = await insertOrganizer(db, 'outro@exemplo.com');
  await sessions.createSession(organizer.id);
  await sessions.createSession(organizer.id);
  const { token: otherToken } = await sessions.createSession(other.id);

  await sessions.endAllSessions(organizer.id);
  assert.equal(await countSessions(), 1);
  assert.equal((await sessions.resolveSession(otherToken)).id, other.id);
});
