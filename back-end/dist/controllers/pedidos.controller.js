"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPedidos = listarPedidos;
exports.criarPedido = criarPedido;
exports.atualizarStatusPedido = atualizarStatusPedido;
exports.listarCobrancas = listarCobrancas;
exports.marcarEnviadoWpp = marcarEnviadoWpp;
exports.dashboard = dashboard;
exports.removerPedido = removerPedido;
const client_1 = require("../db/client");
async function listarPedidos(_req, res) {
    try {
        const { rows } = await client_1.pool.query(`
      SELECT
        p.*,
        c.nome    AS cliente_nome,
        c.celular AS cliente_celular,
        c.email   AS cliente_email,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id',         i.id,
            'nome',       i.nome,
            'emoji',      i.emoji,
            'quantidade', i.quantidade,
            'preco_unit', i.preco_unit
          )
        ) AS itens
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      JOIN itens_pedido i ON i.pedido_id = p.id
      GROUP BY p.id, c.nome, c.celular, c.email
      ORDER BY p.criado_em DESC
    `);
        res.json({ sucesso: true, dados: rows });
    }
    catch (err) {
        console.error('[pedidos] listar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar pedidos' });
    }
}
async function criarPedido(req, res) {
    const { cliente, itens, forma_pgto } = req.body;
    const db = await client_1.pool.connect();
    try {
        await db.query('BEGIN');
        // Upsert do cliente: se já existe por email OU celular, atualiza dados
        const upsertCli = await db.query(`INSERT INTO clientes (nome, email, celular)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
         DO UPDATE SET nome=EXCLUDED.nome, celular=EXCLUDED.celular
       RETURNING id`, [cliente.nome, cliente.email, cliente.celular]);
        const clienteId = upsertCli.rows[0].id;
        // Calcula total
        const total = itens.reduce((s, i) => s + i.preco_unit * i.quantidade, 0);
        // Cria pedido
        const pedidoRes = await db.query(`INSERT INTO pedidos (cliente_id, total, forma_pgto)
       VALUES ($1, $2, $3) RETURNING id`, [clienteId, total, forma_pgto]);
        const pedidoId = pedidoRes.rows[0].id;
        // Insere itens
        for (const item of itens) {
            await db.query(`INSERT INTO itens_pedido (pedido_id, produto_id, nome, emoji, quantidade, preco_unit)
         VALUES ($1, $2, $3, $4, $5, $6)`, [pedidoId, item.produto_id ?? null, item.nome, item.emoji, item.quantidade, item.preco_unit]);
        }
        await db.query('COMMIT');
        // Busca PIX nas configurações para retornar ao front
        const cfgRes = await client_1.pool.query(`SELECT valor FROM configuracoes WHERE chave='pix'`);
        const pix = cfgRes.rows[0]?.valor ?? '';
        res.status(201).json({
            sucesso: true,
            dados: { pedido_id: pedidoId, cliente_id: clienteId, total, forma_pgto, pix },
        });
    }
    catch (err) {
        await db.query('ROLLBACK');
        console.error('[pedidos] criar:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar pedido' });
    }
    finally {
        db.release();
    }
}
async function atualizarStatusPedido(req, res) {
    const { id } = req.params;
    const { status_pgto } = req.body;
    try {
        const { rows } = await client_1.pool.query(`UPDATE pedidos SET status_pgto=$1 WHERE id=$2 RETURNING *`, [status_pgto, id]);
        if (!rows.length) {
            res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado' });
            return;
        }
        res.json({ sucesso: true, dados: rows[0] });
    }
    catch (err) {
        console.error('[pedidos] status:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar status' });
    }
}
async function listarCobrancas(_req, res) {
    try {
        const { rows } = await client_1.pool.query(`
      SELECT
        p.*,
        c.nome    AS cliente_nome,
        c.celular AS cliente_celular,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'nome',       i.nome,
            'emoji',      i.emoji,
            'quantidade', i.quantidade,
            'preco_unit', i.preco_unit
          )
        ) AS itens
      FROM pedidos p
      JOIN clientes c ON c.id = p.cliente_id
      JOIN itens_pedido i ON i.pedido_id = p.id
      WHERE p.forma_pgto = 'agendado' AND p.status_pgto = 'pendente'
      GROUP BY p.id, c.nome, c.celular
      ORDER BY p.criado_em DESC
    `);
        res.json({ sucesso: true, dados: rows });
    }
    catch (err) {
        console.error('[pedidos] cobranças:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar cobranças' });
    }
}
async function marcarEnviadoWpp(req, res) {
    const { id } = req.params;
    try {
        await client_1.pool.query(`UPDATE pedidos SET enviado_wpp=TRUE WHERE id=$1`, [id]);
        res.json({ sucesso: true });
    }
    catch (err) {
        console.error('[pedidos] wpp:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao marcar envio' });
    }
}
async function dashboard(_req, res) {
    try {
        const [pedidos, clientes, recebido, agendado] = await Promise.all([
            client_1.pool.query(`SELECT COUNT(*)::int AS total FROM pedidos`),
            client_1.pool.query(`SELECT COUNT(*)::int AS total FROM clientes`),
            client_1.pool.query(`SELECT COALESCE(SUM(total),0) AS total FROM pedidos WHERE status_pgto='pago'`),
            client_1.pool.query(`SELECT COALESCE(SUM(total),0) AS total FROM pedidos WHERE forma_pgto='agendado' AND status_pgto='pendente'`),
        ]);
        res.json({
            sucesso: true,
            dados: {
                total_pedidos: pedidos.rows[0].total,
                total_clientes: clientes.rows[0].total,
                total_recebido: Number(recebido.rows[0].total),
                total_agendado: Number(agendado.rows[0].total),
            },
        });
    }
    catch (err) {
        console.error('[dashboard]:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro no dashboard' });
    }
}
async function removerPedido(req, res) {
    const { id } = req.params;
    try {
        const { rowCount } = await client_1.pool.query(`DELETE FROM pedidos WHERE id=$1 AND status_pgto='pago'`, [id]);
        if (!rowCount) {
            res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado ou não está pago' });
            return;
        }
        res.json({ sucesso: true, mensagem: 'Pedido excluído com sucesso' });
    }
    catch (err) {
        console.error('[pedidos] remover:', err);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir pedido' });
    }
}
