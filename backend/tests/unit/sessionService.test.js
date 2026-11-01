import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionService } from '../../src/services/sessionService.js';
import { hashToken } from '../../src/utils/crypto.js';
import { createClock, createTestDb, insertOrganizer } from './testDb.js';

let db;
let clock;
let sessions;
let organizer;

beforeEach(() => {
  db = createTestDb();
  clock = createClock();
  sessions = createSessionService({ db, now: clock.now });
  organizer = insertOrganizer(db);
});

const countSessions = () => db.prepare('SELECT COUNT(*) FROM sessions').pluck().get();

test('createSession guarda só o hash do token e vale 30 dias', () => {
  const { token } = sessions.createSession(organizer.id);
  const row = db.prepare('SELECT token_hash, expires_at FROM sessions').get();
  assert.notEqual(row.token_hash, token);
  assert.equal(row.token_hash, hashToken(token));
  assert.equal(row.expires_at, '2026-12-01T12:00:00.000Z');
});

test('resolveSession devolve o organizador da sessão', () => {
  const { token } = sessions.createSession(organizer.id);
  assert.deepEqual(sessions.resolveSession(token), { id: organizer.id, email: organizer.email });
});

test('sessão vencida vira null e é apagada', () => {
  const { token } = sessions.createSession(organizer.id);
  clock.advanceDays(30);
  assert.equal(sessions.resolveSession(token), null);
  assert.equal(countSessions(), 0);
});

test('token vazio ou desconhecido devolve null', () => {
  assert.equal(sessions.resolveSession(undefined), null);
  assert.equal(sessions.resolveSession('desconhecido'), null);
});

test('endSession apaga a sessão', () => {
  const { token } = sessions.createSession(organizer.id);
  sessions.endSession(token);
  assert.equal(sessions.resolveSession(token), null);
});

test('endAllSessions apaga todas as sessões do organizador e só dele', () => {
  const other = insertOrganizer(db, 'outro@exemplo.com');
  sessions.createSession(organizer.id);
  sessions.createSession(organizer.id);
  const { token: otherToken } = sessions.createSession(other.id);

  sessions.endAllSessions(organizer.id);
  assert.equal(countSessions(), 1);
  assert.equal(sessions.resolveSession(otherToken).id, other.id);
});
