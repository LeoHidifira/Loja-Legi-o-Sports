"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.ConfigSchema = exports.StatusPedidoSchema = exports.PedidoSchema = exports.ClienteSchema = exports.ProdutoSchema = void 0;
/**
 * schemas/index.ts
 * Validação de entrada com Zod em todas as rotas da API.
 */
const zod_1 = require("zod");
/* ── Produtos ── */
exports.ProdutoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome obrigatório'),
    descricao: zod_1.z.string().default(''),
    preco: zod_1.z.number({ error: 'Preço deve ser número' }).positive('Preço deve ser positivo'),
    emoji: zod_1.z.string().default('📦'),
    categoria: zod_1.z.enum(['Suplementos', 'Alimentos', 'Bebidas', 'Acessórios', 'Outros']).default('Outros'),
    ativo: zod_1.z.boolean().default(true),
});
/* ── Clientes ── */
exports.ClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: zod_1.z.string().email('E-mail inválido'),
    celular: zod_1.z.string().min(10, 'Celular inválido').max(20),
});
/* ── Itens do pedido ── */
const ItemPedidoSchema = zod_1.z.object({
    produto_id: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1),
    emoji: zod_1.z.string().default('📦'),
    quantidade: zod_1.z.number().int().positive(),
    preco_unit: zod_1.z.number().positive(),
});
/* ── Pedidos ── */
exports.PedidoSchema = zod_1.z.object({
    cliente: exports.ClienteSchema,
    itens: zod_1.z.array(ItemPedidoSchema).min(1, 'Pedido precisa ter ao menos 1 item'),
    forma_pgto: zod_1.z.enum(['pix', 'dinheiro', 'agendado']),
});
/* ── Status do pedido ── */
exports.StatusPedidoSchema = zod_1.z.object({
    status_pgto: zod_1.z.enum(['pendente', 'pago']),
});
/* ── Configurações ── */
exports.ConfigSchema = zod_1.z.object({
    pix: zod_1.z.string().min(1),
    nome: zod_1.z.string().min(1),
    dia_cobranca: zod_1.z.string().regex(/^\d{1,2}$/, 'Dia inválido'),
    template_wpp: zod_1.z.string().min(10),
});
/* ── Login ── */
exports.LoginSchema = zod_1.z.object({
    senha: zod_1.z.string().min(1, 'Senha obrigatória'),
});
