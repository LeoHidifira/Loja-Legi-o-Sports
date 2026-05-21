/**
 * controllers/config.controller.ts
 * Leitura e escrita das configurações da academia.
 */
import { Request, Response } from 'express';
import { pool } from '../db/client';
import { ConfigInput, LoginInput } from '../schemas';

export async function listarConfig(_req: Request, res: Response): Promise<void> {
  try {
    const { rows } = await pool.query(`SELECT chave, valor FROM configuracoes`);
    const dados = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
    res.json({ sucesso: true, dados });
  } catch (err) {
    console.error('[config] listar:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar configurações' });
  }
}

export async function salvarConfig(req: Request, res: Response): Promise<void> {
  const { pix, nome, dia_cobranca, template_wpp } = req.body as ConfigInput;
  try {
    const entradas: [string, string][] = [
      ['pix',          pix],
      ['nome',         nome],
      ['dia_cobranca', dia_cobranca],
      ['template_wpp', template_wpp],
    ];
    for (const [chave, valor] of entradas) {
      await pool.query(
        `INSERT INTO configuracoes (chave, valor) VALUES ($1,$2)
         ON CONFLICT (chave) DO UPDATE SET valor=EXCLUDED.valor`,
        [chave, valor]
      );
    }
    res.json({ sucesso: true, mensagem: 'Configurações salvas' });
  } catch (err) {
    console.error('[config] salvar:', err);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar configurações' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { senha } = req.body as LoginInput;
  const senhaCorreta = process.env.ADMIN_PASSWORD ?? 'legiao123';
  if (senha !== senhaCorreta) {
    res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta' });
    return;
  }
  const token = process.env.ADMIN_TOKEN ?? 'legiao-admin-token';
  res.json({ sucesso: true, token });
}