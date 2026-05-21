"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAdmin = authAdmin;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'legiao-admin-token';
function authAdmin(req, res, next) {
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
