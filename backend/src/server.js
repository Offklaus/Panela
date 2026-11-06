import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDatabase } from './database/connection.js';
import { migrate } from './database/migrate.js';
import { createMailer } from './services/mailService.js';
import { defaultRng } from './utils/random.js';

const env = loadEnv();
const db = createDatabase(env.databaseUrl);
await migrate(db);

const app = createApp({ db, env, mailer: createMailer(env), rng: defaultRng });

app.listen(env.port, (error) => {
  if (error) throw error;
  console.log(`API do Times de Society em http://localhost:${env.port}`);
});
