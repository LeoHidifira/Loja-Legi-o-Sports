"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarClientes = listarClientes;
exports.atualizarCliente = atualizarCliente;
exports.removerCliente = removerCliente;
const client_1 = require("../db/client");
async function listarClientes(_req, res) {
    try {
        const { rows } = await client_1.pool.query(`
      SELECT
        c.*,
        COUNT(p.id)::int          AS total_pedidos,
        COALESCE(SUM(p.total), 0) AS total_gasto
      FROM clientes c
      LEFT JOIN pedidos p ON p.cliente_id = c.id
      GROUP BY c.id
      ORDER BY c.nome
    `);
        res.json({ sucesso: true, dados: rows });
    }
    catch (err) {
        console.error('[clientes] listar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar clientes' });
    }
}
async function atualizarCliente(req, res) {
    const { id } = req.params;
    const { nome, email, celular } = req.body;
    try {
        const { rows } = await client_1.pool.query(`UPDATE clientes SET nome=$1, email=$2, celular=$3 WHERE id=$4 RETURNING *`, [nome, email, celular, id]);
        if (!rows.length) {
            res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
            return;
        }
        res.json({ sucesso: true, dados: rows[0] });
    }
    catch (err) {
        console.error('[clientes] atualizar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente' });
    }
}
async function removerCliente(req, res) {
    const { id } = req.params;
    try {
        await client_1.pool.query(`DELETE FROM clientes WHERE id=$1`, [id]);
        res.json({ sucesso: true, mensagem: 'Cliente removido' });
    }
    catch (err) {
        console.error('[clientes] remover:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover cliente' });
    }
}
