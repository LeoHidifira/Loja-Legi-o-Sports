/**
 * src/index.ts
 * Entry point da API Legião Sports.
 * Configure as variáveis de ambiente em .env (veja .env.example).
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app  = express();
const PORT = Number(process.env.PORT ?? 3333);

/* ── CORS ── */
const origens = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Permite sem origin (curl, Postman, mobile nativo)
    if (!origin || origens.includes(origin)) return cb(null, true);
    cb(new Error(`Origem bloqueada pelo CORS: ${origin}`));
  },
  credentials: true,
}));

/* ── Parsers ── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Health check ── */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Rotas da API ── */
app.use('/api', routes);

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

/* ── Error handler global ── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ sucesso: false, mensagem: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Legião Sports API rodando em http://localhost:${PORT}`);
});