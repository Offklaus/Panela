import pg from 'pg';
import { createDatabase } from '../../src/database/connection.js';
import { migrate } from '../../src/database/migrate.js';
import * as organizerModel from '../../src/models/organizerModel.js';

const TABLES = 'organizers, sessions, password_resets, login_throttle, players, draws';

async function createDatabaseForThisProcess() {
  const adminUrl = process.env.TEST_DATABASE_URL;
  if (!adminUrl) throw new Error('Rode os testes com npm test: o tests/run.js sobe o Postgres de teste.');

  const name = `test_${process.pid}`;
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const db = createDatabase(url.href, { allowExitOnIdle: true });
  await migrate(db);
  return db;
}

// Cada arquivo de teste roda num processo e tem o próprio banco; cada chamada devolve esse banco vazio.
let database;
export async function createTestDb() {
  database ??= createDatabaseForThisProcess();
  const db = await database;
  await db.query(`TRUNCATE ${TABLES} RESTART IDENTITY CASCADE`);
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
