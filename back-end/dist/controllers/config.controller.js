"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarConfig = listarConfig;
exports.salvarConfig = salvarConfig;
exports.login = login;
const client_1 = require("../db/client");
async function listarConfig(_req, res) {
    try {
        const { rows } = await client_1.pool.query(`SELECT chave, valor FROM configuracoes`);
        const dados = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
        res.json({ sucesso: true, dados });
    }
    catch (err) {
        console.error('[config] listar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar configurações' });
    }
}
async function salvarConfig(req, res) {
    const { pix, nome, dia_cobranca, template_wpp } = req.body;
    try {
        const entradas = [
            ['pix', pix],
            ['nome', nome],
            ['dia_cobranca', dia_cobranca],
            ['template_wpp', template_wpp],
        ];
        for (const [chave, valor] of entradas) {
            await client_1.pool.query(`INSERT INTO configuracoes (chave, valor) VALUES ($1,$2)
         ON CONFLICT (chave) DO UPDATE SET valor=EXCLUDED.valor`, [chave, valor]);
        }
        res.json({ sucesso: true, mensagem: 'Configurações salvas' });
    }
    catch (err) {
        console.error('[config] salvar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar configurações' });
    }
}
async function login(req, res) {
    const { senha } = req.body;
    const senhaCorreta = process.env.ADMIN_PASSWORD ?? 'legiao123';
    if (senha !== senhaCorreta) {
        res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta' });
        return;
    }
    const token = process.env.ADMIN_TOKEN ?? 'legiao-admin-token';
    res.json({ sucesso: true, token });
}
