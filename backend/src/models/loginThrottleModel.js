export async function get(db, email) {
  const row = await db.one('SELECT failed_count AS "failedCount", locked_until AS "lockedUntil" FROM login_throttle WHERE email = $1', [
    email,
  ]);
  if (!row) return null;
  return { failedCount: row.failedCount, lockedUntil: row.lockedUntil?.toISOString() ?? null };
}

// Conta uma falha; na falha de número maxFailures, bloqueia por lockMinutes.
// Um bloqueio já vencido recomeça a contagem. Um único comando, para falhas simultâneas não se perderem.
export function registerFailure(db, email, { now, maxFailures, lockMinutes }) {
  const lockedUntil = new Date(now.getTime() + lockMinutes * 60_000).toISOString();
  return db.run(
    `INSERT INTO login_throttle AS t (email, failed_count, locked_until, updated_at)
     VALUES ($1, 1, CASE WHEN 1 >= $2::int THEN $3::timestamptz END, $4::timestamptz)
     ON CONFLICT (email) DO UPDATE SET
       failed_count = CASE WHEN t.locked_until <= $4::timestamptz THEN 1 ELSE t.failed_count + 1 END,
       locked_until = CASE
         WHEN (CASE WHEN t.locked_until <= $4::timestamptz THEN 1 ELSE t.failed_count + 1 END) >= $2::int
         THEN $3::timestamptz
       END,
       updated_at = $4::timestamptz`,
    [email, maxFailures, lockedUntil, now.toISOString()],
  );
}

export function reset(db, email) {
  return db.run('DELETE FROM login_throttle WHERE email = $1', [email]);
}
