export function create(db, { organizerId, tokenHash, createdAt, expiresAt }) {
  return db.run('INSERT INTO sessions (organizer_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4)', [
    organizerId,
    tokenHash,
    createdAt,
    expiresAt,
  ]);
}

export function findValidByTokenHash(db, tokenHash, nowIso) {
  return db.one(
    `SELECT o.id, o.email
       FROM sessions s
       JOIN organizers o ON o.id = s.organizer_id
      WHERE s.token_hash = $1 AND s.expires_at > $2`,
    [tokenHash, nowIso],
  );
}

export function deleteByTokenHash(db, tokenHash) {
  return db.run('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}

export function deleteAllForOrganizer(db, organizerId) {
  return db.run('DELETE FROM sessions WHERE organizer_id = $1', [organizerId]);
}

export function deleteExpired(db, nowIso) {
  return db.run('DELETE FROM sessions WHERE expires_at <= $1', [nowIso]);
}
