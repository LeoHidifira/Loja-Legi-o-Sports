import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // ✔️ único formato válido no pg
  ssl: {
    rejectUnauthorized: false,
  },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool:', err.message);
});