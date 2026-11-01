import { createDatabase } from '../../src/database/connection.js';
import { migrate } from '../../src/database/migrate.js';
import * as organizerModel from '../../src/models/organizerModel.js';

export function createTestDb() {
  const db = createDatabase(':memory:');
  migrate(db);
  return db;
}

// Relógio controlável para regras de tempo (bloqueio, validade de sessão e de link).
export function createClock(start = '2026-11-01T12:00:00.000Z') {
  let current = new Date(start).getTime();
  return {
    now: () => new Date(current),
    advanceMinutes(minutes) {
      current += minutes * 60_000;
    },
    advanceDays(days) {
      current += days * 86_400_000;
    },
  };
}

// Organizador direto no banco, sem o custo do scrypt, para testes que não tratam de login.
export function insertOrganizer(db, email = 'org@exemplo.com') {
  return organizerModel.create(db, {
    email,
    passwordHash: 'scrypt$1$1$1$c2FsdA==$aGFzaA==',
    createdAt: '2026-11-01T12:00:00.000Z',
  });
}

export function expectCode(code) {
  return (error) => {
    if (error?.code !== code) throw new Error(`esperava ${code}, veio ${error?.code}: ${error?.message}`);
    return true;
  };
}
