export function create(db, { organizerId, tokenHash, createdAt, expiresAt }) {
  return db.run('INSERT INTO password_resets (organizer_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4)', [
    organizerId,
    tokenHash,
    createdAt,
    expiresAt,
  ]);
}

export async function findByTokenHash(db, tokenHash) {
  const row = await db.one(
    `SELECT id, organizer_id AS "organizerId", expires_at AS "expiresAt", used_at AS "usedAt"
       FROM password_resets
      WHERE token_hash = $1`,
    [tokenHash],
  );
  if (!row) return null;
  return { ...row, expiresAt: row.expiresAt.toISOString(), usedAt: row.usedAt?.toISOString() ?? null };
}

// Só marca se ainda não foi usado; devolve false quando outro pedido chegou antes.
export async function markUsed(db, id, usedAt) {
  return (await db.run('UPDATE password_resets SET used_at = $1 WHERE id = $2 AND used_at IS NULL', [usedAt, id])) === 1;
}

export async function countCreatedSince(db, organizerId, sinceIso) {
  const row = await db.one(
    'SELECT COUNT(*)::int AS count FROM password_resets WHERE organizer_id = $1 AND created_at > $2',
    [organizerId, sinceIso],
  );
  return row.count;
}
