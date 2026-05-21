/**
 * middleware/validate.ts
 * Valida o body da requisição com um schema Zod.
 * Retorna 400 com detalhes dos erros se inválido.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const erros = result.error.issues.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      }));

      res.status(400).json({
        sucesso: false,
        erros,
      });

      return;
    }

    req.body = result.data;

    next();
  };
}