export function create(db, { email, passwordHash, createdAt }) {
  const info = db
    .prepare('INSERT INTO organizers (email, password_hash, created_at) VALUES (?, ?, ?)')
    .run(email, passwordHash, createdAt);
  return { id: Number(info.lastInsertRowid), email };
}

export function findByEmail(db, email) {
  return db.prepare('SELECT id, email, password_hash AS passwordHash FROM organizers WHERE email = ?').get(email) ?? null;
}

export function findById(db, id) {
  return db.prepare('SELECT id, email FROM organizers WHERE id = ?').get(id) ?? null;
}

export function updatePasswordHash(db, id, passwordHash) {
  db.prepare('UPDATE organizers SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}
