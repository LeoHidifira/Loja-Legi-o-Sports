"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida no .env');
}
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    keepAlive: true,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
});
// Teste de conexão na inicialização (opcional mas útil para debug)
exports.pool.connect()
    .then(client => {
    console.log('✅ Conectado ao banco de dados com sucesso');
    client.release();
})
    .catch(err => console.error('❌ Erro ao conectar ao banco:', err.message));
