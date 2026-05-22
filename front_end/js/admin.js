/**
 * js/admin.js
 * Painel admin completo.
 * ✅ goAdmin() leva para LOGIN, não expõe o painel diretamente.
 * ✅ Deletar pedido apenas quando status = PAGO.
 */
import { api } from './api.js';
import { fmtR, fmtData, pgtoLabel, statusLabel, toast, goView, iniciais } from './utils.js';

/* ══ Login ══ */
window.fazerLogin = async () => {
  const senha = document.getElementById('login-senha').value;
  const errEl = document.getElementById('login-err');
  try {
    const res = await api.auth.login(senha);
    sessionStorage.setItem('ls_token', res.token);
    errEl.hidden = true;
    document.getElementById('login-senha').value = '';
    goView('admin');
    renderDashboard();
  } catch {
    errEl.hidden = false;
  }
};

window.sair = () => {
  sessionStorage.removeItem('ls_token');
  goView('loja');
};

/* goAdmin: sempre vai para o LOGIN, nunca expõe o painel sem autenticação */
window.goAdmin = () => {
  goView('login');
};

/* ══ Tabs ══ */
window.adminTab = (tab, el) => {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('admin-section--active'));
  document.querySelectorAll('.admin-nav__item').forEach(n => n.classList.remove('admin-nav__item--active'));
  document.getElementById(`sec-${tab}`).classList.add('admin-section--active');
  el.classList.add('admin-nav__item--active');
  const map = {
    dashboard: renderDashboard,
    pedidos:   renderPedidos,
    clientes:  renderClientes,
    cobran:    renderCobrancas,
    produtos:  renderProdutosAdmin,
    config:    carregarConfig,
  };
  if (map[tab]) map[tab]();
};

/* ══ Dashboard ══ */
async function renderDashboard() {
  try {
    const res = await api.pedidos.dashboard();
    const d   = res.dados;
    document.getElementById('metrics-grid').innerHTML = `
      <article class="metric-card metric-card--green" role="listitem">
        <p class="metric-card__lbl">Total de pedidos</p>
        <p class="metric-card__val">${d.total_pedidos}</p>
      </article>
      <article class="metric-card metric-card--white" role="listitem">
        <p class="metric-card__lbl">Clientes cadastrados</p>
        <p class="metric-card__val">${d.total_clientes}</p>
      </article>
      <article class="metric-card metric-card--orange" role="listitem">
        <p class="metric-card__lbl">A receber (agendado)</p>
        <p class="metric-card__val">${fmtR(d.total_agendado)}</p>
      </article>
      <article class="metric-card metric-card--green" role="listitem">
        <p class="metric-card__lbl">Total recebido</p>
        <p class="metric-card__val" id="dash-total-rec">${fmtR(d.total_recebido)}</p>
      </article>`;

    const pedRes = await api.pedidos.listar();
    const tbody  = document.getElementById('dash-pedidos');
    const lista  = pedRes.dados.slice(0, 8);
    tbody.innerHTML = lista.length
      ? lista.map(p => `<tr>
          <td>${p.cliente_nome}</td>
          <td>${p.itens.length} item(ns)</td>
          <td><strong>${fmtR(p.total)}</strong></td>
          <td>${pgtoLabel(p.forma_pgto)}</td>
          <td>${statusLabel(p.status_pgto)}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="tbl-empty">Nenhum pedido ainda.</td></tr>';
  } catch { toast('Erro ao carregar dashboard', 'err'); }
}

/* ══ Pedidos ══ */
let todosPedidos = [];

async function renderPedidos() {
  try {
    const res    = await api.pedidos.listar();
    todosPedidos = res.dados;
    renderTblPedidos(todosPedidos);
  } catch { toast('Erro ao carregar pedidos', 'err'); }
}

function renderTblPedidos(lista) {
  const tbody = document.getElementById('tbl-pedidos');
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="tbl-empty">Nenhum pedido.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(p => {
    const isPago = p.status_pgto === 'pago';
    // ✅ Botão excluir aparece APENAS quando o pedido está PAGO
    const btnDel = isPago
      ? `<button class="btn-tbl-del btn-tbl-del--pedido"
                 onclick="window.abrirModalDelPedido('${p.id}','${p.cliente_nome}',${p.total})"
                 aria-label="Excluir pedido">🗑 Excluir</button>`
      : `<span class="tbl-del-placeholder" title="Disponível apenas para pedidos pagos">—</span>`;

    return `<tr>
      <td>${p.cliente_nome}</td>
      <td>${p.cliente_celular}</td>
      <td class="tbl-muted">${p.itens.map(i => `${i.emoji} ${i.nome}${i.quantidade > 1 ? ' ×' + i.quantidade : ''}`).join(', ')}</td>
      <td><strong>${fmtR(p.total)}</strong></td>
      <td>${pgtoLabel(p.forma_pgto)}</td>
      <td>
        <select class="status-select ${isPago ? 'status-select--pago' : 'status-select--pend'}"
                onchange="window.mudarStatus('${p.id}', this)"
                aria-label="Status do pagamento"
                ${isPago ? 'disabled' : ''}>
          <option value="pendente" ${!isPago ? 'selected' : ''}>⏳ Pendente</option>
          <option value="pago"     ${isPago  ? 'selected' : ''}>✅ Pago</option>
        </select>
      </td>
      <td class="tbl-muted tbl-sm">${fmtData(p.criado_em)}</td>
      <td>${btnDel}</td>
    </tr>`;
  }).join('');
}

/* ── Mudar status ── */
window.mudarStatus = (id, selectEl) => {
  if (selectEl.value !== 'pago') return;
  const p = todosPedidos.find(x => x.id === id);
  if (!p) return;
  document.getElementById('confirm-pgto-nome').textContent  = p.cliente_nome;
  document.getElementById('confirm-pgto-total').textContent = fmtR(p.total);
  const modal = document.getElementById('modal-confirm-pgto');
  modal.removeAttribute('hidden');
  modal.classList.add('modal--open');
  window._confirmId  = id;
  window._confirmSel = selectEl;
};

window.confirmarPagamento = async () => {
  try {
    await api.pedidos.status(window._confirmId, 'pago');
    fecharModalConfirm();
    toast('Pagamento confirmado! ✅', 'ok');
    await renderPedidos();
    const el = document.getElementById('dash-total-rec');
    if (el) {
      const res = await api.pedidos.dashboard();
      el.textContent = fmtR(res.dados.total_recebido);
    }
  } catch { toast('Erro ao confirmar pagamento', 'err'); }
};

window.cancelarConfirm = () => {
  if (window._confirmSel) {
    window._confirmSel.value     = 'pendente';
    window._confirmSel.className = 'status-select status-select--pend';
  }
  fecharModalConfirm();
};

function fecharModalConfirm() {
  const modal = document.getElementById('modal-confirm-pgto');
  modal.classList.remove('modal--open');
  modal.setAttribute('hidden', '');
  window._confirmId = null; window._confirmSel = null;
}

/* ── Deletar pedido pago ── */
window.abrirModalDelPedido = (id, nome, total) => {
  document.getElementById('del-pedido-nome').textContent  = nome;
  document.getElementById('del-pedido-total').textContent = fmtR(Number(total));
  const modal = document.getElementById('modal-del-pedido');
  modal.removeAttribute('hidden');
  modal.classList.add('modal--open');
  window._delPedidoId = id;
};

window.fecharModalDelPedido = () => {
  const modal = document.getElementById('modal-del-pedido');
  modal.classList.remove('modal--open');
  modal.setAttribute('hidden', '');
  window._delPedidoId = null;
};

window.confirmarDelPedido = async () => {
  try {
    await api.pedidos.deletar(window._delPedidoId);
    window.fecharModalDelPedido();
    toast('Pedido excluído com sucesso', 'ok');
    await renderPedidos();
    const el = document.getElementById('dash-total-rec');
    if (el) {
      const res = await api.pedidos.dashboard();
      el.textContent = fmtR(res.dados.total_recebido);
    }
  } catch { toast('Erro ao excluir pedido', 'err'); }
};

window.filtrarPedidos = (q) => {
  const f = q.toLowerCase();
  renderTblPedidos(todosPedidos.filter(p =>
    p.cliente_nome.toLowerCase().includes(f) || p.cliente_celular.includes(f)
  ));
};

/* ══ Clientes ══ */
let todosClientes = [];

async function renderClientes() {
  try {
    const res     = await api.clientes.listar();
    todosClientes = res.dados;
    renderTblClientes(todosClientes);
  } catch { toast('Erro ao carregar clientes', 'err'); }
}

function renderTblClientes(lista) {
  const tbody = document.getElementById('tbl-clientes');
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="tbl-empty">Nenhum cliente ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map(c => `<tr>
    <td><strong>${c.nome}</strong></td>
    <td class="tbl-muted">${c.email}</td>
    <td>${c.celular}</td>
    <td>${c.total_pedidos}</td>
    <td><strong class="txt-green">${fmtR(c.total_gasto)}</strong></td>
    <td class="tbl-muted tbl-sm">${fmtData(c.criado_em)}</td>
    <td>
      <div class="tbl-actions">
        <button class="btn-tbl-edit" onclick="window.abrirEditarCliente('${c.id}')" aria-label="Editar ${c.nome}">✏</button>
        <button class="btn-tbl-del"  onclick="window.removerCliente('${c.id}','${c.nome}')" aria-label="Remover ${c.nome}">🗑</button>
      </div>
    </td>
  </tr>`).join('');
}

window.filtrarClientes = (q) => {
  const f = q.toLowerCase();
  renderTblClientes(todosClientes.filter(c =>
    c.nome.toLowerCase().includes(f) || c.email.toLowerCase().includes(f) || c.celular.includes(f)
  ));
};

window.abrirEditarCliente = (id) => {
  const c = todosClientes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('ec-nome').value  = c.nome;
  document.getElementById('ec-email').value = c.email;
  document.getElementById('ec-cel').value   = c.celular;
  window._editClienteId = id;
  const modal = document.getElementById('modal-edit-cliente');
  modal.removeAttribute('hidden');
  modal.classList.add('modal--open');
};

window.fecharModalEditCliente = () => {
  const modal = document.getElementById('modal-edit-cliente');
  modal.classList.remove('modal--open');
  modal.setAttribute('hidden', '');
  window._editClienteId = null;
};

window.salvarEdicaoCliente = async () => {
  const nome    = document.getElementById('ec-nome').value.trim();
  const email   = document.getElementById('ec-email').value.trim();
  const celular = document.getElementById('ec-cel').value.trim();
  if (!nome || !email || !celular) { toast('Preencha todos os campos', 'err'); return; }
  try {
    await api.clientes.atualizar(window._editClienteId, { nome, email, celular });
    window.fecharModalEditCliente();
    await renderClientes();
    toast('Cliente atualizado!', 'ok');
  } catch (err) { toast(err.message, 'err'); }
};

window.removerCliente = async (id, nome) => {
  if (!confirm(`Remover o cliente "${nome}"?`)) return;
  try {
    await api.clientes.remover(id);
    await renderClientes();
    toast('Cliente removido', 'ok');
  } catch { toast('Erro ao remover cliente', 'err'); }
};

/* ══ Cobranças WhatsApp ══ */
async function renderCobrancas() {
  try {
    const res  = await api.pedidos.cobrancas();
    const list = document.getElementById('cobrancas-list');
    if (!res.dados.length) {
      list.innerHTML = '<p class="empty-state"><span aria-hidden="true" class="empty-state__icon">✅</span>Nenhuma cobrança pendente.</p>';
      return;
    }
    const cfgRes = await api.config.listar();
    const cfg    = cfgRes.dados;

    list.innerHTML = res.dados.map(p => {
      const wppMsg   = gerarMsgWpp(p, cfg);
      const celLimpo = p.cliente_celular.replace(/\D/g, '');
      const wppLink  = `https://wa.me/55${celLimpo}?text=${encodeURIComponent(wppMsg)}`;
      return `
      <article class="cobranca-card">
        <header class="cobranca-card__head">
          <div class="cobranca-avatar" aria-hidden="true">${iniciais(p.cliente_nome)}</div>
          <div>
            <p class="cobranca-card__nome">${p.cliente_nome}</p>
            <p class="cobranca-card__fone">📱 ${p.cliente_celular}</p>
          </div>
          <time class="cobranca-card__data">${fmtData(p.criado_em)}</time>
        </header>
        <div class="cobranca-card__body">
          <ul class="cobranca-produtos" aria-label="Produtos do pedido">
            ${p.itens.map(i => `
              <li class="cobranca-prod-row">
                <span>${i.emoji} ${i.nome}${i.quantidade > 1 ? ' ×' + i.quantidade : ''}</span>
                <span>${fmtR(i.preco_unit * i.quantidade)}</span>
              </li>`).join('')}
          </ul>
          <div class="cobranca-subtotal">
            <strong>Subtotal</strong>
            <span class="cobranca-subtotal__val">${fmtR(p.total)}</span>
          </div>
          <a href="${wppLink}" target="_blank" rel="noopener noreferrer"
             class="btn-wpp${p.enviado_wpp ? ' btn-wpp--enviado' : ''}"
             onclick="window.marcarWpp('${p.id}')">
            📲 ${p.enviado_wpp ? 'Reenviar cobrança' : 'Enviar cobrança pelo WhatsApp'}
          </a>
        </div>
      </article>`;
    }).join('');
  } catch { toast('Erro ao carregar cobranças', 'err'); }
}

window.marcarWpp = async (id) => {
  try { await api.pedidos.wpp(id); } catch { /* silencioso */ }
  setTimeout(renderCobrancas, 400);
};

function gerarMsgWpp(pedido, cfg) {
  const prods = pedido.itens.map(i =>
    `• ${i.emoji} ${i.nome}${i.quantidade > 1 ? ' ×' + i.quantidade : ''} — ${fmtR(i.preco_unit * i.quantidade)}`
  ).join('\n');
  return (cfg.template_wpp ?? '')
    .replace('{nome}',     pedido.cliente_nome)
    .replace('{produtos}', prods)
    .replace('{subtotal}', fmtR(pedido.total))
    .replace('{pix}',      cfg.pix ?? '')
    .replace('{dia}',      cfg.dia_cobranca ?? '28');
}

/* ══ Produtos Admin ══ */
let editProdId = null;

async function renderProdutosAdmin() {
  try {
    const res  = await api.produtos.listar();
    const grid = document.getElementById('prod-admin-grid');
    grid.innerHTML = res.dados.map(p => `
      <article class="prod-admin-card">
        <div class="prod-admin-card__top">
          <span class="prod-admin-card__emoji" aria-hidden="true">${p.emoji}</span>
          <div>
            <p class="prod-admin-card__nome">${p.nome}</p>
            <p class="prod-admin-card__cat">${p.categoria}</p>
          </div>
        </div>
        <p class="prod-admin-card__preco">${fmtR(p.preco)}</p>
        <p class="prod-admin-card__desc">${p.descricao}</p>
        <footer class="prod-admin-card__actions">
          <button class="btn-edit-prod" onclick="window.editarProd('${p.id}')">✏ Editar</button>
          <button class="btn-del-prod"  onclick="window.deletarProd('${p.id}')" aria-label="Excluir ${p.nome}">🗑</button>
        </footer>
      </article>`).join('');
  } catch { toast('Erro ao carregar produtos', 'err'); }
}

window.abrirModalProd = () => {
  editProdId = null;
  document.getElementById('modal-prod-title').textContent = 'Novo produto';
  ['mp-nome','mp-desc','mp-preco','mp-emoji'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('mp-cat').value = 'Suplementos';
  const modal = document.getElementById('modal-prod-bg');
  modal.removeAttribute('hidden');
  modal.classList.add('modal--open');
};

window.fecharModalProd = () => {
  const modal = document.getElementById('modal-prod-bg');
  modal.classList.remove('modal--open');
  modal.setAttribute('hidden', '');
};

window.editarProd = async (id) => {
  try {
    const res = await api.produtos.listar();
    const p   = res.dados.find(x => x.id === id);
    if (!p) return;
    editProdId = id;
    document.getElementById('modal-prod-title').textContent = 'Editar produto';
    document.getElementById('mp-nome').value  = p.nome;
    document.getElementById('mp-desc').value  = p.descricao;
    document.getElementById('mp-preco').value = p.preco;
    document.getElementById('mp-emoji').value = p.emoji;
    document.getElementById('mp-cat').value   = p.categoria;
    const modal = document.getElementById('modal-prod-bg');
    modal.removeAttribute('hidden');
    modal.classList.add('modal--open');
  } catch { toast('Erro ao carregar produto', 'err'); }
};

window.deletarProd = async (id) => {
  if (!confirm('Excluir este produto?')) return;
  try {
    await api.produtos.remover(id);
    await renderProdutosAdmin();
    toast('Produto excluído', 'ok');
  } catch { toast('Erro ao excluir produto', 'err'); }
};

window.salvarProduto = async () => {
  const nome      = document.getElementById('mp-nome').value.trim();
  const descricao = document.getElementById('mp-desc').value.trim();
  const preco     = parseFloat(document.getElementById('mp-preco').value);
  const emoji     = document.getElementById('mp-emoji').value.trim() || '📦';
  const categoria = document.getElementById('mp-cat').value;
  if (!nome || isNaN(preco)) { toast('Preencha nome e preço', 'err'); return; }
  const body = { nome, descricao, preco, emoji, categoria, ativo: true };
  try {
    if (editProdId) await api.produtos.atualizar(editProdId, body);
    else            await api.produtos.criar(body);
    window.fecharModalProd();
    await renderProdutosAdmin();
    toast(editProdId ? 'Produto atualizado' : 'Produto adicionado', 'ok');
  } catch { toast('Erro ao salvar produto', 'err'); }
};

/* ══ Configurações ══ */
async function carregarConfig() {
  try {
    const res = await api.config.listar();
    const d   = res.dados;
    document.getElementById('cfg-nome').value     = d.nome ?? '';
    document.getElementById('cfg-pix').value      = d.pix ?? '';
    document.getElementById('cfg-dia').value      = d.dia_cobranca ?? '28';
    document.getElementById('cfg-template').value = d.template_wpp ?? '';
  } catch { toast('Erro ao carregar configurações', 'err'); }
}

window.salvarConfig = async () => {
  const body = {
    nome:         document.getElementById('cfg-nome').value,
    pix:          document.getElementById('cfg-pix').value,
    dia_cobranca: document.getElementById('cfg-dia').value,
    template_wpp: document.getElementById('cfg-template').value,
  };
  try {
    await api.config.salvar(body);
    toast('Configurações salvas!', 'ok');
  } catch { toast('Erro ao salvar configurações', 'err'); }
};

/* ══ Export CSV ══ */
window.exportarCSV = async (tipo) => {
  try {
    let csv = '', nome = 'export.csv';
    if (tipo === 'pedidos') {
      const res = await api.pedidos.listar();
      csv  = 'Cliente,Celular,Email,Itens,Total,Pagamento,Status,Data\n';
      csv += res.dados.map(p =>
        `"${p.cliente_nome}","${p.cliente_celular}","${p.cliente_email ?? ''}",` +
        `"${p.itens.map(i => i.nome + (i.quantidade > 1 ? ' x' + i.quantidade : '')).join(' | ')}",` +
        `"${fmtR(p.total)}","${p.forma_pgto}","${p.status_pgto}","${fmtData(p.criado_em)}"`
      ).join('\n');
      nome = 'pedidos.csv';
    } else {
      const res = await api.clientes.listar();
      csv  = 'Nome,Email,Celular,Pedidos,Total Gasto,Cadastro\n';
      csv += res.dados.map(c =>
        `"${c.nome}","${c.email}","${c.celular}","${c.total_pedidos}","${fmtR(c.total_gasto)}","${fmtData(c.criado_em)}"`
      ).join('\n');
      nome = 'clientes.csv';
    }
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = nome; a.click();
    toast('CSV exportado!', 'ok');
  } catch { toast('Erro ao exportar', 'err'); }
};