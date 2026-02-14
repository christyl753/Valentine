import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL manquante pour les fonctions API');
}

const pool = globalThis.__pgPool || new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
globalThis.__pgPool = pool;

export default pool;
