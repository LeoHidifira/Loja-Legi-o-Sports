/**
 * controllers/clientes.controller.ts
 * CRUD de clientes com upsert automático.
 */
import { Request, Response } from 'express';
import { pool } from '../db/client';
import { ClienteInput } from '../schemas';

export async function listarClientes(_req: Request, res: Response): Promise<void> {
  try {
    const { rows } = await pool.query(`
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
  } catch (err) {
    console.error('[clientes] listar:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar clientes' });
  }
}

export async function atualizarCliente(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nome, email, celular } = req.body as ClienteInput;
  try {
    const { rows } = await pool.query(
      `UPDATE clientes SET nome=$1, email=$2, celular=$3 WHERE id=$4 RETURNING *`,
      [nome, email, celular, id]
    );
    if (!rows.length) { res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' }); return; }
    res.json({ sucesso: true, dados: rows[0] });
  } catch (err) {
    console.error('[clientes] atualizar:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente' });
  }
}

export async function removerCliente(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM clientes WHERE id=$1`, [id]);
    res.json({ sucesso: true, mensagem: 'Cliente removido' });
  } catch (err) {
    console.error('[clientes] remover:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover cliente' });
  }
}