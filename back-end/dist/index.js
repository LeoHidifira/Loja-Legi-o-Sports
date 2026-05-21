"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * src/index.ts
 * Entry point da API Legião Sports.
 * Configure as variáveis de ambiente em .env (veja .env.example).
 */
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 3333);
/* ── CORS ── */
const origens = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim()).filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        const allowed = [
            "https://loja-legiao-sports.vercel.app",
            "http://localhost:5500"
        ];
        const isAllowed = allowed.includes(origin) ||
            origin.includes("vercel.app");
        return cb(null, isAllowed);
    },
    credentials: true,
}));
/* ── Parsers ── */
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/* ── Health check ── */
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
/* ── Rotas da API ── */
app.use('/api', routes_1.default);
/* ── 404 ── */
app.use((_req, res) => {
    res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});
/* ── Error handler global ── */
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ sucesso: false, mensagem: err.message });
});
app.listen(PORT, () => {
    console.log(`🚀 Legião Sports API rodando em http://localhost:${PORT}`);
});
