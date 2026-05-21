/**
 * js/loja.js
 * Renderização da loja, carrinho e drawer.
 */
import { api }  from './api.js';
import { fmtR, toast, goView } from './utils.js';

let produtos    = [];
let carrinho    = [];
let catAtiva    = 'Todos';

/* ── Inicializa loja ── */
export async function initLoja() {
  try {
    const res = await api.produtos.listar();
    produtos = res.dados;
    renderCategorias();
    renderProdutos();
  } catch {
    toast('Erro ao carregar produtos', 'err');
  }
}

function renderCategorias() {
  const cats = ['Todos', ...new Set(produtos.map(p => p.categoria))];
  const bar = document.getElementById('cat-bar');
  bar.innerHTML = cats.map(c =>
    `<button class="cat-pill${c === catAtiva ? ' cat-pill--active' : ''}"
             onclick="window.setCat('${c}')">${c}</button>`
  ).join('');
}

function renderProdutos() {
  const lista  = catAtiva === 'Todos' ? produtos : produtos.filter(p => p.categoria === catAtiva);
  const grid   = document.getElementById('produtos-grid');
  if (!lista.length) {
    grid.innerHTML = `<p class="empty-state"><span class="empty-state__icon" aria-hidden="true">📦</span>Nenhum produto nesta categoria.</p>`;
    return;
  }
  grid.innerHTML = lista.map(p => `
    <article class="prod-card" aria-label="${p.nome}">
      <div class="prod-card__img" aria-hidden="true">
        <span class="prod-card__cat-badge">${p.categoria}</span>
        <span class="prod-card__emoji">${p.emoji}</span>
      </div>
      <div class="prod-card__body">
        <h3 class="prod-card__nome">${p.nome}</h3>
        <p  class="prod-card__desc">${p.descricao}</p>
        <footer class="prod-card__foot">
          <span class="prod-card__preco">${fmtR(p.preco)}</span>
          <button class="btn-add" id="ba-${p.id}"
                  onclick="window.addCart('${p.id}')"
                  aria-label="Adicionar ${p.nome} ao carrinho">+</button>
        </footer>
      </div>
    </article>`).join('');
}

window.setCat = (c) => { catAtiva = c; renderCategorias(); renderProdutos(); };

window.addCart = (id) => {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  const ex = carrinho.find(x => x.id === id);
  if (ex) ex.qty++;
  else carrinho.push({ ...p, qty: 1 });
  atualizarCartUI();
  renderDrawer();
  const btn = document.getElementById('ba-' + id);
  if (btn) { btn.classList.add('btn-add--added'); setTimeout(() => btn.classList.remove('btn-add--added'), 400); }
};

window.changeQty = (id, d) => {
  const i = carrinho.find(x => x.id === id);
  if (!i) return;
  i.qty += d;
  if (i.qty <= 0) window.removeItem(id);
  else { atualizarCartUI(); renderDrawer(); }
};

window.removeItem = (id) => {
  carrinho = carrinho.filter(x => x.id !== id);
  atualizarCartUI();
  renderDrawer();
};

export function getCarrinho() { return carrinho; }
export function limparCarrinho() { carrinho = []; atualizarCartUI(); renderDrawer(); }

function atualizarCartUI() {
  const total = carrinho.reduce((s, i) => s + Number(i.preco) * i.qty, 0);
  const qtd   = carrinho.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-badge').textContent = qtd;
  document.getElementById('cart-total').textContent = fmtR(total);
  const btn = document.getElementById('btn-checkout');
  if (btn) btn.disabled = carrinho.length === 0;
}

function renderDrawer() {
  const body = document.getElementById('drawer-body');
  if (!carrinho.length) {
    body.innerHTML = `<p class="cart-empty"><span aria-hidden="true" class="cart-empty__icon">🛒</span>Seu carrinho está vazio.</p>`;
    return;
  }
  body.innerHTML = carrinho.map(i => `
    <article class="cart-item" aria-label="${i.nome}">
      <span class="cart-item__emoji" aria-hidden="true">${i.emoji}</span>
      <div class="cart-item__info">
        <p class="cart-item__nome">${i.nome}</p>
        <p class="cart-item__price">${fmtR(Number(i.preco) * i.qty)}</p>
        <div class="cart-item__qty" role="group" aria-label="Quantidade">
          <button class="qty-btn" onclick="window.changeQty('${i.id}',-1)" aria-label="Diminuir">−</button>
          <span class="qty-val" aria-live="polite">${i.qty}</span>
          <button class="qty-btn" onclick="window.changeQty('${i.id}',1)"  aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="btn-rm-item" onclick="window.removeItem('${i.id}')" aria-label="Remover ${i.nome}">×</button>
    </article>`).join('');
}

window.toggleDrawer = () => {
  document.getElementById('drawer').classList.toggle('drawer--open');
  document.getElementById('overlay').classList.toggle('overlay--open');
};