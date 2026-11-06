import pg from 'pg';

// Interface comum ao banco e a uma transação; os models recebem qualquer um dos dois.
function wrap(queryable) {
  return {
    async query(sql, params) {
      return (await queryable.query(sql, params)).rows;
    },
    async one(sql, params) {
      return (await queryable.query(sql, params)).rows[0] ?? null;
    },
    async run(sql, params) {
      return (await queryable.query(sql, params)).rowCount;
    },
  };
}

export function createDatabase(connectionString, options = {}) {
  const pool = new pg.Pool({ connectionString, ...options });
  pool.on('error', (error) => console.error('Erro em conexão ociosa com o Postgres:', error));

  return {
    ...wrap(pool),

    // Roda fn numa transação; um erro desfaz tudo e é repassado.
    async transaction(fn) {
      const client = await pool.connect();
      let broken;
      try {
        await client.query('BEGIN');
        const result = await fn(wrap(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          broken = rollbackError;
        }
        throw error;
      } finally {
        client.release(broken);
      }
    },

    close: () => pool.end(),
  };
}
