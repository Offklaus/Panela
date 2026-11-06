import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const MIGRATION_LOCK = 20261101;

export async function migrate(db) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  await db.transaction(async (tx) => {
    // Se duas instâncias subirem juntas, uma espera a outra terminar.
    await tx.query('SELECT pg_advisory_xact_lock($1)', [MIGRATION_LOCK]);
    await tx.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL)');
    await tx.query('ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY');

    const applied = new Set((await tx.query('SELECT name FROM schema_migrations')).map((row) => row.name));
    for (const file of files) {
      if (applied.has(file)) continue;
      await tx.query(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
      await tx.query('INSERT INTO schema_migrations (name, applied_at) VALUES ($1, $2)', [file, new Date().toISOString()]);
    }
  });
}
