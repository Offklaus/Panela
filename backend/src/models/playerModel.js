const SELECT = 'SELECT id, name, rating, present FROM players';

export function listByOrganizer(db, organizerId) {
  return db.query(`${SELECT} WHERE organizer_id = $1 ORDER BY id`, [organizerId]);
}

export function listPresentByOrganizer(db, organizerId) {
  return db.query(`${SELECT} WHERE organizer_id = $1 AND present ORDER BY id`, [organizerId]);
}

export async function countByOrganizer(db, organizerId) {
  const row = await db.one('SELECT COUNT(*)::int AS count FROM players WHERE organizer_id = $1', [organizerId]);
  return row.count;
}

export function findByIdForOrganizer(db, organizerId, id) {
  return db.one(`${SELECT} WHERE organizer_id = $1 AND id = $2`, [organizerId, id]);
}

export function findByNameKey(db, organizerId, nameKey) {
  return db.one(`${SELECT} WHERE organizer_id = $1 AND name_key = $2`, [organizerId, nameKey]);
}

export function insert(db, { organizerId, name, nameKey, rating, createdAt }) {
  return db.run('INSERT INTO players (organizer_id, name, name_key, rating, created_at) VALUES ($1, $2, $3, $4, $5)', [
    organizerId,
    name,
    nameKey,
    rating,
    createdAt,
  ]);
}

export function updateRating(db, organizerId, id, rating) {
  return db.run('UPDATE players SET rating = $1 WHERE organizer_id = $2 AND id = $3', [rating, organizerId, id]);
}

export function updatePresent(db, organizerId, id, present) {
  return db.run('UPDATE players SET present = $1 WHERE organizer_id = $2 AND id = $3', [present, organizerId, id]);
}

export function setAllPresent(db, organizerId, present) {
  return db.run('UPDATE players SET present = $1 WHERE organizer_id = $2', [present, organizerId]);
}

export async function remove(db, organizerId, id) {
  return (await db.run('DELETE FROM players WHERE organizer_id = $1 AND id = $2', [organizerId, id])) === 1;
}
