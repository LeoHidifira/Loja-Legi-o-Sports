// src/types/index.ts

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  emoji: string;
  categoria: string;
  ativo: boolean;
  criado_em: string;
}

export interface ItemCarrinho extends Produto {
  qty: number;
}

export interface ItemPedido {
  id?: string;
  nome: string;
  emoji: string;
  quantidade: number;
  preco_unit: number;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_celular: string;
  cliente_email: string;
  total: number;
  forma_pgto: 'pix' | 'dinheiro' | 'agendado';
  status_pgto: 'pendente' | 'pago';
  enviado_wpp: boolean;
  criado_em: string;
  itens: ItemPedido[];
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  celular: string;
  criado_em: string;
  total_pedidos: number;
  total_gasto: number;
}

export interface Config {
  pix: string;
  nome: string;
  dia_cobranca: string;
  template_wpp: string;
}

export interface DashboardData {
  total_pedidos: number;
  total_clientes: number;
  total_recebido: number;
  total_agendado: number;
}
