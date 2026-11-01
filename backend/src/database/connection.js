import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function createDatabase(filePath) {
  const inMemory = filePath === ':memory:';
  if (!inMemory) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const db = new Database(filePath);
  db.pragma('foreign_keys = ON');
  if (!inMemory) {
    db.pragma('journal_mode = WAL');
  }
  return db;
}
