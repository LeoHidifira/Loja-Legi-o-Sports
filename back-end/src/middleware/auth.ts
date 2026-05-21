/**
 * middleware/auth.ts
 * Protege rotas administrativas.
 * O frontend envia o header: Authorization: Bearer <ADMIN_TOKEN>
 * O token é gerado no login e armazenado no sessionStorage do browser.
 */
import { Request, Response, NextFunction } from 'express';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'legiao-admin-token';

export function authAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ sucesso: false, mensagem: 'Não autorizado' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    res.status(403).json({ sucesso: false, mensagem: 'Token inválido' });
    return;
  }
  next();
}