/**
 * schemas/index.ts
 * Validação de entrada com Zod em todas as rotas da API.
 */
import { z } from 'zod';

/* ── Produtos ── */
export const ProdutoSchema = z.object({
  nome:      z.string().min(1, 'Nome obrigatório'),
  descricao: z.string().default(''),
  preco:     z.number({ error: 'Preço deve ser número' }).positive('Preço deve ser positivo'),
  emoji:     z.string().default('📦'),
  categoria: z.enum(['Suplementos','Alimentos','Bebidas','Acessórios','Outros']).default('Outros'),
  ativo:     z.boolean().default(true),
});
export type ProdutoInput = z.infer<typeof ProdutoSchema>;

/* ── Clientes ── */
export const ClienteSchema = z.object({
  nome:    z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email:   z.string().email('E-mail inválido'),
  celular: z.string().min(10, 'Celular inválido').max(20),
});
export type ClienteInput = z.infer<typeof ClienteSchema>;

/* ── Itens do pedido ── */
const ItemPedidoSchema = z.object({
  produto_id: z.string().uuid().optional(),
  nome:       z.string().min(1),
  emoji:      z.string().default('📦'),
  quantidade: z.number().int().positive(),
  preco_unit: z.number().positive(),
});

/* ── Pedidos ── */
export const PedidoSchema = z.object({
  cliente: ClienteSchema,
  itens:   z.array(ItemPedidoSchema).min(1, 'Pedido precisa ter ao menos 1 item'),
  forma_pgto: z.enum(['pix','dinheiro','agendado']),
});
export type PedidoInput = z.infer<typeof PedidoSchema>;

/* ── Status do pedido ── */
export const StatusPedidoSchema = z.object({
  status_pgto: z.enum(['pendente','pago']),
});
export type StatusPedidoInput = z.infer<typeof StatusPedidoSchema>;

/* ── Configurações ── */
export const ConfigSchema = z.object({
  pix:          z.string().min(1),
  nome:         z.string().min(1),
  dia_cobranca: z.string().regex(/^\d{1,2}$/, 'Dia inválido'),
  template_wpp: z.string().min(10),
});
export type ConfigInput = z.infer<typeof ConfigSchema>;

/* ── Login ── */
export const LoginSchema = z.object({
  senha: z.string().min(1, 'Senha obrigatória'),
});
export type LoginInput = z.infer<typeof LoginSchema>;