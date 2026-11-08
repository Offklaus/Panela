export function findByOrganizer(db, organizerId) {
  return db.one('SELECT name, icon FROM clubs WHERE organizer_id = $1', [organizerId]);
}

// Devolve null quando a conta já tinha time: a chave primária garante um por conta (research §2 da 005).
export function insert(db, { organizerId, name, icon, createdAt }) {
  return db.one(
    `INSERT INTO clubs (organizer_id, name, icon, created_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (organizer_id) DO NOTHING RETURNING name, icon`,
    [organizerId, name, icon, createdAt],
  );
}