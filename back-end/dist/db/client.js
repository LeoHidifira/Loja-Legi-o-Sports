"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
/**
 * db/client.ts
 * Pool de conexão com PostgreSQL (Supabase).
 * Configure DATABASE_URL no .env copiando de:
 * Supabase → Project Settings → Database → Connection string (URI)
 */
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida no .env');
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // obrigatório no Supabase
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('error', (err) => {
    console.error('[DB] Erro inesperado no pool:', err.message);
});
