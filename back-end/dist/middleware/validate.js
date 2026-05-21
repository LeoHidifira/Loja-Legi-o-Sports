"use strict";
/**
 * middleware/validate.ts
 * Valida o body da requisição com um schema Zod.
 * Retorna 400 com detalhes dos erros se inválido.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, res, next) => {
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
