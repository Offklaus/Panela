export function create(db, { organizerId, tokenHash, createdAt, expiresAt }) {
  db.prepare('INSERT INTO password_resets (organizer_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    organizerId,
    tokenHash,
    createdAt,
    expiresAt,
  );
}

export function findByTokenHash(db, tokenHash) {
  return (
    db
      .prepare(
        `SELECT id, organizer_id AS organizerId, expires_at AS expiresAt, used_at AS usedAt
           FROM password_resets
          WHERE token_hash = ?`,
      )
      .get(tokenHash) ?? null
  );
}

// Só marca se ainda não foi usado; devolve false quando outro pedido chegou antes.
export function markUsed(db, id, usedAt) {
  return db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ? AND used_at IS NULL').run(usedAt, id).changes === 1;
}

export function countCreatedSince(db, organizerId, sinceIso) {
  return db
    .prepare('SELECT COUNT(*) FROM password_resets WHERE organizer_id = ? AND created_at > ?')
    .pluck()
    .get(organizerId, sinceIso);
}
