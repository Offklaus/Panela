export function create(db, { email, passwordHash, createdAt }) {
  return db.one(
    'INSERT INTO organizers (email, password_hash, created_at) VALUES ($1, $2, $3) RETURNING id, email',
    [email, passwordHash, createdAt],
  );
}

export function findByEmail(db, email) {
  return db.one('SELECT id, email, password_hash AS "passwordHash" FROM organizers WHERE email = $1', [email]);
}

export function findById(db, id) {
  return db.one('SELECT id, email FROM organizers WHERE id = $1', [id]);
}

export function updatePasswordHash(db, id, passwordHash) {
  return db.run('UPDATE organizers SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

// Dentro de uma transação, faz as alterações do mesmo organizador acontecerem uma de cada vez.
export function lock(db, id) {
  return db.one('SELECT id FROM organizers WHERE id = $1 FOR UPDATE', [id]);
}
