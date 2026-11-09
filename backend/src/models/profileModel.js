// A data volta como texto "YYYY-MM-DD", sem passar por Date no fuso do servidor (research §3 da 006).
const COLUMNS = `nickname, to_char(birth_date, 'YYYY-MM-DD') AS "birthDate", position, foot`;

export function findByOrganizer(db, organizerId) {
  return db.one(`SELECT ${COLUMNS} FROM profiles WHERE organizer_id = $1`, [organizerId]);
}

// Cria ou substitui: a chave primária garante um perfil por conta, e o último salvo vale (research §2).
export function upsert(db, { organizerId, nickname, birthDate, position, foot, updatedAt }) {
  return db.one(
    `INSERT INTO profiles (organizer_id, nickname, birth_date, position, foot, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (organizer_id) DO UPDATE SET
       nickname = EXCLUDED.nickname,
       birth_date = EXCLUDED.birth_date,
       position = EXCLUDED.position,
       foot = EXCLUDED.foot,
       updated_at = EXCLUDED.updated_at
     RETURNING ${COLUMNS}`,
    [organizerId, nickname, birthDate, position, foot, updatedAt],
  );
}
