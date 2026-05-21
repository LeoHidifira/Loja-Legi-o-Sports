/**
 * db/client.ts
 * Pool de conexão com PostgreSQL (Supabase).
 * Configure DATABASE_URL no .env copiando de:
 * Supabase → Project Settings → Database → Connection string (URI)
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida no .env');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // 🔥 FIX REAL para Supabase + Render
  ssl: {
    rejectUnauthorized: false,
  },

  // 🔥 importante para pooler
  keepAlive: true,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});