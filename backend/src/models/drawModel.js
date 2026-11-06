export function upsert(db, { organizerId, createdAt, teams, bench }) {
  return db.run(
    `INSERT INTO draws (organizer_id, created_at, teams_json, bench_json, stale) VALUES ($1, $2, $3::jsonb, $4::jsonb, FALSE)
     ON CONFLICT (organizer_id) DO UPDATE SET
       created_at = excluded.created_at,
       teams_json = excluded.teams_json,
       bench_json = excluded.bench_json,
       stale = FALSE`,
    [organizerId, createdAt, JSON.stringify(teams), JSON.stringify(bench)],
  );
}

export async function findByOrganizer(db, organizerId) {
  const row = await db.one('SELECT created_at, teams_json, bench_json, stale FROM draws WHERE organizer_id = $1', [organizerId]);
  if (!row) return null;
  return {
    createdAt: row.created_at.toISOString(),
    teams: row.teams_json,
    bench: row.bench_json,
    stale: row.stale,
  };
}

export async function isStale(db, organizerId) {
  const row = await db.one('SELECT stale FROM draws WHERE organizer_id = $1', [organizerId]);
  return row?.stale === true;
}

// Sem sorteio salvo, não faz nada.
export function setStale(db, organizerId) {
  return db.run('UPDATE draws SET stale = TRUE WHERE organizer_id = $1', [organizerId]);
}
