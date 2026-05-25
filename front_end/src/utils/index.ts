// src/utils/index.ts

export function fmtR(valor: number): string {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

export function fmtData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function pgtoLabel(p: string): string {
  if (p === 'pix')      return '<span class="badge badge-pix">PIX</span>';
  if (p === 'dinheiro') return '<span class="badge badge-din">Dinheiro</span>';
  return '<span class="badge badge-pend-pgto">Agendado</span>';
}

export function statusLabel(s: string): string {
  if (s === 'pago') return '<span class="badge badge-pago">✅ Pago</span>';
  return '<span class="badge badge-pendente">⏳ Pendente</span>';
}

export function iniciais(nome: string): string {
  return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
