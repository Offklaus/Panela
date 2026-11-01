export function upsert(db, { organizerId, createdAt, teams, bench }) {
  db.prepare(
    `INSERT INTO draws (organizer_id, created_at, teams_json, bench_json, stale) VALUES (?, ?, ?, ?, 0)
     ON CONFLICT (organizer_id) DO UPDATE SET
       created_at = excluded.created_at,
       teams_json = excluded.teams_json,
       bench_json = excluded.bench_json,
       stale = 0`,
  ).run(organizerId, createdAt, JSON.stringify(teams), JSON.stringify(bench));
}

export function findByOrganizer(db, organizerId) {
  const row = db
    .prepare('SELECT created_at AS createdAt, teams_json, bench_json, stale FROM draws WHERE organizer_id = ?')
    .get(organizerId);
  if (!row) return null;
  return {
    createdAt: row.createdAt,
    teams: JSON.parse(row.teams_json),
    bench: JSON.parse(row.bench_json),
    stale: row.stale === 1,
  };
}

export function isStale(db, organizerId) {
  return db.prepare('SELECT stale FROM draws WHERE organizer_id = ?').pluck().get(organizerId) === 1;
}

// Sem sorteio salvo, não faz nada.
export function setStale(db, organizerId) {
  db.prepare('UPDATE draws SET stale = 1 WHERE organizer_id = ?').run(organizerId);
}
