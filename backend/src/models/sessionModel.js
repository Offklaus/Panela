export function create(db, { organizerId, tokenHash, createdAt, expiresAt }) {
  db.prepare('INSERT INTO sessions (organizer_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    organizerId,
    tokenHash,
    createdAt,
    expiresAt,
  );
}

export function findValidByTokenHash(db, tokenHash, nowIso) {
  return (
    db
      .prepare(
        `SELECT o.id, o.email
           FROM sessions s
           JOIN organizers o ON o.id = s.organizer_id
          WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(tokenHash, nowIso) ?? null
  );
}

export function deleteByTokenHash(db, tokenHash) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function deleteAllForOrganizer(db, organizerId) {
  db.prepare('DELETE FROM sessions WHERE organizer_id = ?').run(organizerId);
}

export function deleteExpired(db, nowIso) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso);
}
