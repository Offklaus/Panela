export function get(db, email) {
  return (
    db
      .prepare('SELECT failed_count AS failedCount, locked_until AS lockedUntil FROM login_throttle WHERE email = ?')
      .get(email) ?? null
  );
}

// Conta uma falha; na falha de número maxFailures, bloqueia por lockMinutes.
// Um bloqueio já vencido recomeça a contagem do zero.
export function registerFailure(db, email, { now, maxFailures, lockMinutes }) {
  const nowIso = now.toISOString();
  const row = get(db, email);
  const lockExpired = Boolean(row?.lockedUntil && row.lockedUntil <= nowIso);
  const failedCount = (row && !lockExpired ? row.failedCount : 0) + 1;
  const lockedUntil =
    failedCount >= maxFailures ? new Date(now.getTime() + lockMinutes * 60_000).toISOString() : null;

  db.prepare(
    `INSERT INTO login_throttle (email, failed_count, locked_until, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (email) DO UPDATE SET
       failed_count = excluded.failed_count,
       locked_until = excluded.locked_until,
       updated_at = excluded.updated_at`,
  ).run(email, failedCount, lockedUntil, nowIso);

  return { failedCount, lockedUntil };
}

export function reset(db, email) {
  db.prepare('DELETE FROM login_throttle WHERE email = ?').run(email);
}
