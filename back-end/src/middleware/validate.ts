/**
 * middleware/validate.ts
 * Valida o body da requisição com um schema Zod.
 * Retorna 400 com detalhes dos erros se inválido.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const erros = (result.error as ZodError).errors.map((e) => ({
        campo:    e.path.join('.'),
        mensagem: e.message,
      }));
      res.status(400).json({ sucesso: false, erros });
      return;
    }
    req.body = result.data;
    next();
  };
}