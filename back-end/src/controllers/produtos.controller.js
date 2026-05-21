"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarProdutos = listarProdutos;
exports.criarProduto = criarProduto;
exports.atualizarProduto = atualizarProduto;
exports.removerProduto = removerProduto;
const client_1 = require("../db/client");
async function listarProdutos(_req, res) {
    try {
        const { rows } = await client_1.pool.query(`SELECT * FROM produtos WHERE ativo = TRUE ORDER BY categoria, nome`);
        res.json({ sucesso: true, dados: rows });
    }
    catch (err) {
        console.error('[produtos] listar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar produtos' });
    }
}
async function criarProduto(req, res) {
    const { nome, descricao, preco, emoji, categoria, ativo } = req.body;
    try {
        const { rows } = await client_1.pool.query(`INSERT INTO produtos (nome, descricao, preco, emoji, categoria, ativo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [nome, descricao, preco, emoji, categoria, ativo]);
        res.status(201).json({ sucesso: true, dados: rows[0] });
    }
    catch (err) {
        console.error('[produtos] criar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar produto' });
    }
}
async function atualizarProduto(req, res) {
    const { id } = req.params;
    const { nome, descricao, preco, emoji, categoria, ativo } = req.body;
    try {
        const { rows } = await client_1.pool.query(`UPDATE produtos SET nome=$1, descricao=$2, preco=$3, emoji=$4, categoria=$5, ativo=$6
       WHERE id=$7 RETURNING *`, [nome, descricao, preco, emoji, categoria, ativo, id]);
        if (!rows.length) {
            res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado' });
            return;
        }
        res.json({ sucesso: true, dados: rows[0] });
    }
    catch (err) {
        console.error('[produtos] atualizar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar produto' });
    }
}
async function removerProduto(req, res) {
    const { id } = req.params;
    try {
        // Soft delete — mantém histórico nos pedidos
        await client_1.pool.query(`UPDATE produtos SET ativo=FALSE WHERE id=$1`, [id]);
        res.json({ sucesso: true, mensagem: 'Produto removido' });
    }
    catch (err) {
        console.error('[produtos] remover:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover produto' });
    }
}
