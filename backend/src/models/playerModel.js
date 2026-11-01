const SELECT = 'SELECT id, name, rating, present FROM players';

const toPlayer = (row) => (row ? { id: row.id, name: row.name, rating: row.rating, present: row.present === 1 } : null);

export function listByOrganizer(db, organizerId) {
  return db.prepare(`${SELECT} WHERE organizer_id = ? ORDER BY id`).all(organizerId).map(toPlayer);
}

export function listPresentByOrganizer(db, organizerId) {
  return db.prepare(`${SELECT} WHERE organizer_id = ? AND present = 1 ORDER BY id`).all(organizerId).map(toPlayer);
}

export function countByOrganizer(db, organizerId) {
  return db.prepare('SELECT COUNT(*) FROM players WHERE organizer_id = ?').pluck().get(organizerId);
}

export function findByIdForOrganizer(db, organizerId, id) {
  return toPlayer(db.prepare(`${SELECT} WHERE organizer_id = ? AND id = ?`).get(organizerId, id));
}

export function findByNameKey(db, organizerId, nameKey) {
  return toPlayer(db.prepare(`${SELECT} WHERE organizer_id = ? AND name_key = ?`).get(organizerId, nameKey));
}

export function insert(db, { organizerId, name, nameKey, rating, createdAt }) {
  db.prepare(
    'INSERT INTO players (organizer_id, name, name_key, rating, present, created_at) VALUES (?, ?, ?, ?, 1, ?)',
  ).run(organizerId, name, nameKey, rating, createdAt);
}

export function updateRating(db, organizerId, id, rating) {
  db.prepare('UPDATE players SET rating = ? WHERE organizer_id = ? AND id = ?').run(rating, organizerId, id);
}

export function updatePresent(db, organizerId, id, present) {
  db.prepare('UPDATE players SET present = ? WHERE organizer_id = ? AND id = ?').run(present ? 1 : 0, organizerId, id);
}

export function setAllPresent(db, organizerId, present) {
  db.prepare('UPDATE players SET present = ? WHERE organizer_id = ?').run(present ? 1 : 0, organizerId);
}

export function remove(db, organizerId, id) {
  return db.prepare('DELETE FROM players WHERE organizer_id = ? AND id = ?').run(organizerId, id).changes === 1;
}
