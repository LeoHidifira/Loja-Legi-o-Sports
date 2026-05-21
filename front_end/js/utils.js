/**
 * js/utils.js
 * Funções utilitárias reutilizadas em todos os módulos.
 */

/** Formata número para moeda brasileira */
export function fmtR(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

/** Formata ISO string para data/hora pt-BR */
export function fmtData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Badge HTML de forma de pagamento */
export function pgtoLabel(p) {
  if (p === 'pix')      return '<span class="badge badge-pix">PIX</span>';
  if (p === 'dinheiro') return '<span class="badge badge-din">Dinheiro</span>';
  return '<span class="badge badge-pend-pgto">Agendado</span>';
}

/** Badge HTML de status do pedido */
export function statusLabel(s) {
  if (s === 'pago') return '<span class="badge badge-pago">✅ Pago</span>';
  return '<span class="badge badge-pendente">⏳ Pendente</span>';
}

/** Toast global */
let _toastTimer;
export function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = `toast toast--${tipo} toast--show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('toast--show'), 3200);
}

/** Navega entre views (SPA simples) */
export function goView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  const target = document.getElementById(`view-${id}`);
  if (target) { target.classList.add('view--active'); window.scrollTo(0, 0); }
}

/** Iniciais para avatar */
export function iniciais(nome) {
  return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}