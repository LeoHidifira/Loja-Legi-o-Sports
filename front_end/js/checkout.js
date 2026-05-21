/**
 * js/checkout.js
 * Checkout: formulário, pagamento, PIX e sucesso.
 */
import { api }  from './api.js';
import { fmtR, toast, goView } from './utils.js';
import { getCarrinho, limparCarrinho } from './loja.js';

let pgtoSelecionado = 'pix';

export function initCheckout() {
  renderOrderSummary();
  goView('checkout');
}

function renderOrderSummary() {
  const carrinho = getCarrinho();
  const total    = carrinho.reduce((s, i) => s + Number(i.preco) * i.qty, 0);
  document.getElementById('order-items').innerHTML = carrinho.map(i => `
    <div class="order-item">
      <span class="order-item__nome">${i.emoji} ${i.nome} ×${i.qty}</span>
      <span class="order-item__preco">${fmtR(Number(i.preco) * i.qty)}</span>
    </div>`).join('');
  document.getElementById('order-total').textContent = fmtR(total);
}

window.selectPgto = (el, tipo) => {
  document.querySelectorAll('.pgto-opt').forEach(o => o.classList.remove('pgto-opt--selected'));
  el.classList.add('pgto-opt--selected');
  pgtoSelecionado = tipo;
};

window.finalizar = async () => {
  const nome  = document.getElementById('f-nome').value.trim();
  const cel   = document.getElementById('f-celular').value.trim();
  const email = document.getElementById('f-email').value.trim();
  if (!nome || !cel || !email) { toast('Preencha todos os dados', 'err'); return; }

  const carrinho = getCarrinho();
  const body = {
    cliente:    { nome, email, celular: cel },
    itens:      carrinho.map(i => ({
      produto_id: i.id,
      nome:       i.nome,
      emoji:      i.emoji,
      quantidade: i.qty,
      preco_unit: Number(i.preco),
    })),
    forma_pgto: pgtoSelecionado,
  };

  try {
    const res = await api.pedidos.criar(body);
    const { pix, total, forma_pgto } = res.dados;
    limparCarrinho();

    if (forma_pgto === 'pix') {
      document.getElementById('pix-key-display').textContent = pix;
      document.getElementById('modal-pix').classList.add('modal--open');
    } else if (forma_pgto === 'dinheiro') {
      showSucesso('💵', 'Pedido registrado!',
        `Olá ${nome}! Dirija-se ao professor para pagar ${fmtR(total)}.`);
    } else {
      showSucesso('📅', 'Cobrança agendada!',
        `Olá ${nome}! Você receberá a cobrança pelo WhatsApp no dia de vencimento.`);
    }
  } catch (err) {
    toast(err.message ?? 'Erro ao finalizar pedido', 'err');
  }
};

function showSucesso(icon, titulo, msg) {
  document.getElementById('sucesso-icon').textContent   = icon;
  document.getElementById('sucesso-titulo').textContent = titulo;
  document.getElementById('sucesso-msg').textContent    = msg;
  goView('sucesso');
}

window.copiarPix = () => {
  const chave = document.getElementById('pix-key-display').textContent;
  navigator.clipboard.writeText(chave).then(() => toast('Chave PIX copiada!', 'ok'));
};

window.fecharPix = () => {
  document.getElementById('modal-pix').classList.remove('modal--open');
  showSucesso('✅', 'Pedido confirmado!', 'Assim que identificarmos o PIX seu pedido será liberado. Bons treinos! 🥋');
};