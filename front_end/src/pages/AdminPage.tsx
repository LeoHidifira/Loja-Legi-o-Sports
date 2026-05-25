// src/pages/AdminPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { fmtR, fmtData, iniciais } from '../utils';
import { Pedido, Cliente, Config, DashboardData } from '../types';

type Tab = 'dashboard' | 'pedidos' | 'clientes' | 'cobran' | 'produtos' | 'config';

// ────────────────────────────────────────────────────────────────
// Helpers de badge (HTML direto como no original)
// ────────────────────────────────────────────────────────────────
function PgtoLabel({ p }: { p: string }) {
  if (p === 'pix')      return <span className="badge badge-pix">PIX</span>;
  if (p === 'dinheiro') return <span className="badge badge-din">Dinheiro</span>;
  return <span className="badge badge-pend-pgto">Agendado</span>;
}
function StatusLabel({ s }: { s: string }) {
  if (s === 'pago') return <span className="badge badge-pago">✅ Pago</span>;
  return <span className="badge badge-pendente">⏳ Pendente</span>;
}

// ────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');

  const sair = () => { logout(); navigate('/'); };

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'pedidos',   icon: '🧾', label: 'Pedidos'   },
    { id: 'clientes',  icon: '👥', label: 'Clientes'  },
    { id: 'cobran',    icon: '💬', label: 'Cobranças' },
    { id: 'produtos',  icon: '📦', label: 'Produtos'  },
    { id: 'config',    icon: '⚙️', label: 'Config'    },
  ];

  return (
    <section id="view-admin" className="view view--active" aria-label="Painel administrativo">
      <aside className="admin-side" aria-label="Menu administrativo">
        <div className="admin-logo">
          <p className="admin-logo__nome">LEGIÃO SPORTS</p>
          <p className="admin-logo__sub">Admin</p>
        </div>
        <nav className="admin-nav" aria-label="Seções do painel">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`admin-nav__item${tab === t.id ? ' admin-nav__item--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span aria-hidden="true">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <footer className="admin-side__footer">
          <button className="btn-sair" onClick={sair}>← Sair</button>
        </footer>
      </aside>

      <main className="admin-main">
        {tab === 'dashboard' && <TabDashboard toast={toast} />}
        {tab === 'pedidos'   && <TabPedidos   toast={toast} />}
        {tab === 'clientes'  && <TabClientes  toast={toast} />}
        {tab === 'cobran'    && <TabCobrancas toast={toast} />}
        {tab === 'produtos'  && <TabProdutos  toast={toast} />}
        {tab === 'config'    && <TabConfig    toast={toast} />}
      </main>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Dashboard
// ────────────────────────────────────────────────────────────────
function TabDashboard({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [dash, setDash]     = useState<DashboardData | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    api.pedidos.dashboard().then(r => setDash(r.dados)).catch(() => toast('Erro ao carregar dashboard', 'err'));
    api.pedidos.listar().then(r => setPedidos(r.dados.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <section className="admin-section admin-section--active" id="sec-dashboard">
      <h2 className="admin-section__title">Dashboard</h2>
      <p className="admin-section__sub">Visão geral da academia</p>
      <div className="metrics-grid" role="list">
        {dash && (<>
          <article className="metric-card metric-card--green" role="listitem">
            <p className="metric-card__lbl">Total de pedidos</p>
            <p className="metric-card__val">{dash.total_pedidos}</p>
          </article>
          <article className="metric-card metric-card--white" role="listitem">
            <p className="metric-card__lbl">Clientes cadastrados</p>
            <p className="metric-card__val">{dash.total_clientes}</p>
          </article>
          <article className="metric-card metric-card--orange" role="listitem">
            <p className="metric-card__lbl">A receber (agendado)</p>
            <p className="metric-card__val">{fmtR(dash.total_agendado)}</p>
          </article>
          <article className="metric-card metric-card--green" role="listitem">
            <p className="metric-card__lbl">Total recebido</p>
            <p className="metric-card__val">{fmtR(dash.total_recebido)}</p>
          </article>
        </>)}
      </div>
      <div className="table-wrap">
        <header className="table-head"><h3>Últimos pedidos</h3></header>
        <div className="table-scroll">
          <table aria-label="Últimos pedidos">
            <thead><tr><th>Cliente</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Status</th></tr></thead>
            <tbody>
              {pedidos.length === 0
                ? <tr><td colSpan={5} className="tbl-empty">Nenhum pedido ainda.</td></tr>
                : pedidos.map(p => (
                  <tr key={p.id}>
                    <td>{p.cliente_nome}</td>
                    <td>{p.itens.length} item(ns)</td>
                    <td><strong>{fmtR(p.total)}</strong></td>
                    <td><PgtoLabel p={p.forma_pgto} /></td>
                    <td><StatusLabel s={p.status_pgto} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Pedidos
// ────────────────────────────────────────────────────────────────
function TabPedidos({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [todos, setTodos]  = useState<Pedido[]>([]);
  const [lista, setLista]  = useState<Pedido[]>([]);
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [confirmPedido, setConfirmPedido] = useState<Pedido | null>(null);
  const [delId, setDelId]   = useState<string | null>(null);
  const [delPedido, setDelPedido] = useState<Pedido | null>(null);

  const load = async () => {
    const res = await api.pedidos.listar();
    setTodos(res.dados); setLista(res.dados);
  };

  useEffect(() => { load().catch(() => toast('Erro ao carregar pedidos', 'err')); }, []);

  const exportarCSV = async () => {
    const res = await api.pedidos.listar();
    let csv = 'Cliente,Celular,Email,Itens,Total,Pagamento,Status,Data\n';
    csv += res.dados.map((p: Pedido) =>
      `"${p.cliente_nome}","${p.cliente_celular}","${p.cliente_email ?? ''}",` +
      `"${p.itens.map(i => i.nome + (i.quantidade > 1 ? ' x'+i.quantidade:'')).join(' | ')}",` +
      `"${fmtR(p.total)}","${p.forma_pgto}","${p.status_pgto}","${fmtData(p.criado_em)}"`
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = 'pedidos.csv'; a.click();
    toast('CSV exportado!', 'ok');
  };

  const filtrar = (q: string) => {
    const f = q.toLowerCase();
    setLista(todos.filter(p => p.cliente_nome.toLowerCase().includes(f) || p.cliente_celular.includes(f)));
  };

  const confirmarPagamento = async () => {
    if (!confirmId) return;
    try {
      await api.pedidos.status(confirmId, 'pago');
      setConfirmId(null); setConfirmPedido(null);
      toast('Pagamento confirmado! ✅', 'ok');
      await load();
    } catch { toast('Erro ao confirmar pagamento', 'err'); }
  };

  const confirmarDel = async () => {
    if (!delId) return;
    try {
      await api.pedidos.deletar(delId);
      setDelId(null); setDelPedido(null);
      toast('Pedido excluído com sucesso', 'ok');
      await load();
    } catch { toast('Erro ao excluir pedido', 'err'); }
  };

  return (
    <section className="admin-section admin-section--active" id="sec-pedidos">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div><h2 className="admin-section__title">Pedidos</h2><p className="admin-section__sub">Todos os pedidos realizados</p></div>
        <button className="btn-export" onClick={exportarCSV}>⬇ CSV</button>
      </div>
      <div className="table-wrap">
        <header className="table-head">
          <h3>Pedidos</h3>
          <input className="tbl-search" type="search" placeholder="Buscar..." onInput={e => filtrar((e.target as HTMLInputElement).value)} aria-label="Buscar pedidos" />
        </header>
        <div className="table-scroll">
          <table aria-label="Lista de pedidos">
            <thead><tr><th>Cliente</th><th>Celular</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead>
            <tbody>
              {lista.length === 0
                ? <tr><td colSpan={8} className="tbl-empty">Nenhum pedido.</td></tr>
                : lista.map(p => {
                  const isPago = p.status_pgto === 'pago';
                  return (
                    <tr key={p.id}>
                      <td>{p.cliente_nome}</td>
                      <td>{p.cliente_celular}</td>
                      <td className="tbl-muted">{p.itens.map(i => `${i.emoji} ${i.nome}${i.quantidade > 1 ? ' ×'+i.quantidade:''}`).join(', ')}</td>
                      <td><strong>{fmtR(p.total)}</strong></td>
                      <td><PgtoLabel p={p.forma_pgto} /></td>
                      <td>
                        <select
                          className={`status-select ${isPago ? 'status-select--pago' : 'status-select--pend'}`}
                          value={p.status_pgto}
                          disabled={isPago}
                          aria-label="Status do pagamento"
                          onChange={() => { setConfirmId(p.id); setConfirmPedido(p); }}
                        >
                          <option value="pendente">⏳ Pendente</option>
                          <option value="pago">✅ Pago</option>
                        </select>
                      </td>
                      <td className="tbl-muted tbl-sm">{fmtData(p.criado_em)}</td>
                      <td>
                        {isPago
                          ? <button className="btn-tbl-del" onClick={() => { setDelId(p.id); setDelPedido(p); }} aria-label="Excluir pedido">🗑 Excluir</button>
                          : <span className="tbl-muted" title="Disponível apenas para pedidos pagos">—</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal confirmar pagamento */}
      <div className={`modal-bg${confirmPedido ? ' modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Confirmar pagamento" hidden={!confirmPedido || undefined}>
        <div className="modal-confirm">
          <h2>Confirmar pagamento?</h2>
          <p>Cliente: <strong>{confirmPedido?.cliente_nome}</strong></p>
          <p className="modal-confirm__val">{confirmPedido ? fmtR(confirmPedido.total) : ''}</p>
          <p>Esta ação marcará o pedido como <strong>pago</strong>.</p>
          <div className="modal-confirm__actions">
            <button className="btn-confirm-nao" onClick={() => { setConfirmId(null); setConfirmPedido(null); }}>Cancelar</button>
            <button className="btn-confirm-sim" onClick={confirmarPagamento}>✅ Confirmar</button>
          </div>
        </div>
      </div>

      {/* Modal excluir pedido */}
      <div className={`modal-bg${delPedido ? ' modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Excluir pedido" hidden={!delPedido || undefined}>
        <div className="modal-confirm">
          <h2>🗑 Excluir pedido?</h2>
          <p>Cliente: <strong>{delPedido?.cliente_nome}</strong></p>
          <p className="modal-confirm__val">{delPedido ? fmtR(delPedido.total) : ''}</p>
          <p>Esta ação é <strong>irreversível</strong>. O pedido será removido permanentemente.</p>
          <div className="modal-confirm__actions">
            <button className="btn-confirm-nao" onClick={() => { setDelId(null); setDelPedido(null); }}>Cancelar</button>
            <button className="btn-confirm-del" onClick={confirmarDel}>🗑 Excluir</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Clientes
// ────────────────────────────────────────────────────────────────
function TabClientes({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [todos, setTodos]   = useState<Cliente[]>([]);
  const [lista, setLista]   = useState<Cliente[]>([]);
  const [editCli, setEditCli] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', celular: '' });

  const load = async () => {
    const res = await api.clientes.listar();
    setTodos(res.dados); setLista(res.dados);
  };
  useEffect(() => { load().catch(() => toast('Erro ao carregar clientes', 'err')); }, []);

  const filtrar = (q: string) => {
    const f = q.toLowerCase();
    setLista(todos.filter(c => c.nome.toLowerCase().includes(f) || c.email.toLowerCase().includes(f) || c.celular.includes(f)));
  };

  const exportarCSV = async () => {
    const res = await api.clientes.listar();
    let csv = 'Nome,Email,Celular,Pedidos,Total Gasto,Cadastro\n';
    csv += res.dados.map((c: Cliente) =>
      `"${c.nome}","${c.email}","${c.celular}","${c.total_pedidos}","${fmtR(c.total_gasto)}","${fmtData(c.criado_em)}"`
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = 'clientes.csv'; a.click();
    toast('CSV exportado!', 'ok');
  };

  const abrirEditar = (c: Cliente) => { setEditCli(c); setForm({ nome: c.nome, email: c.email, celular: c.celular }); };

  const salvarEdicao = async () => {
    if (!editCli) return;
    if (!form.nome || !form.email || !form.celular) { toast('Preencha todos os campos', 'err'); return; }
    try {
      await api.clientes.atualizar(editCli.id, form);
      setEditCli(null);
      await load();
      toast('Cliente atualizado!', 'ok');
    } catch (err: any) { toast(err.message, 'err'); }
  };

  const remover = async (c: Cliente) => {
    if (!confirm(`Remover o cliente "${c.nome}"?`)) return;
    try {
      await api.clientes.remover(c.id);
      await load();
      toast('Cliente removido', 'ok');
    } catch { toast('Erro ao remover cliente', 'err'); }
  };

  return (
    <section className="admin-section admin-section--active" id="sec-clientes">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div><h2 className="admin-section__title">Clientes</h2><p className="admin-section__sub">Todos os clientes cadastrados</p></div>
        <button className="btn-export" onClick={exportarCSV}>⬇ CSV</button>
      </div>
      <div className="table-wrap">
        <header className="table-head">
          <h3>Clientes</h3>
          <input className="tbl-search" type="search" placeholder="Buscar..." onInput={e => filtrar((e.target as HTMLInputElement).value)} aria-label="Buscar clientes" />
        </header>
        <div className="table-scroll">
          <table aria-label="Lista de clientes">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Celular</th><th>Pedidos</th><th>Total gasto</th><th>Cadastro</th><th>Ações</th></tr></thead>
            <tbody>
              {lista.length === 0
                ? <tr><td colSpan={7} className="tbl-empty">Nenhum cliente ainda.</td></tr>
                : lista.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nome}</strong></td>
                    <td className="tbl-muted">{c.email}</td>
                    <td>{c.celular}</td>
                    <td>{c.total_pedidos}</td>
                    <td><strong className="txt-green">{fmtR(c.total_gasto)}</strong></td>
                    <td className="tbl-muted tbl-sm">{fmtData(c.criado_em)}</td>
                    <td>
                      <div className="tbl-actions">
                        <button className="btn-tbl-edit" onClick={() => abrirEditar(c)} aria-label={`Editar ${c.nome}`}>✏</button>
                        <button className="btn-tbl-del"  onClick={() => remover(c)} aria-label={`Remover ${c.nome}`}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal editar cliente */}
      <div className={`modal-bg${editCli ? ' modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Editar cliente" hidden={!editCli || undefined}>
        <div className="modal-edit-cli">
          <h2>Editar cliente</h2>
          <div className="form-group"><label htmlFor="ec-nome">Nome</label><input type="text" id="ec-nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} autoComplete="name" /></div>
          <div className="form-group"><label htmlFor="ec-email">E-mail</label><input type="email" id="ec-email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" /></div>
          <div className="form-group"><label htmlFor="ec-cel">Celular</label><input type="tel" id="ec-cel" value={form.celular} onChange={e => setForm(f => ({ ...f, celular: e.target.value }))} autoComplete="tel" /></div>
          <div className="modal-actions">
            <button className="btn-cancelar" onClick={() => setEditCli(null)}>Cancelar</button>
            <button className="btn-salvar"   onClick={salvarEdicao}>Salvar</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Cobranças
// ────────────────────────────────────────────────────────────────
function TabCobrancas({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [cfg, setCfg]             = useState<Config | null>(null);

  const load = async () => {
    const [cobRes, cfgRes] = await Promise.all([api.pedidos.cobrancas(), api.config.listar()]);
    setCobrancas(cobRes.dados);
    setCfg(cfgRes.dados);
  };
  useEffect(() => { load().catch(() => toast('Erro ao carregar cobranças', 'err')); }, []);

  const gerarMsg = (p: any) => {
    if (!cfg) return '';
    const prods = p.itens.map((i: any) =>
      `• ${i.emoji} ${i.nome}${i.quantidade > 1 ? ' ×' + i.quantidade : ''} — ${fmtR(i.preco_unit * i.quantidade)}`
    ).join('\n');
    return (cfg.template_wpp ?? '')
      .replace('{nome}', p.cliente_nome)
      .replace('{produtos}', prods)
      .replace('{subtotal}', fmtR(p.total))
      .replace('{pix}', cfg.pix ?? '')
      .replace('{dia}', cfg.dia_cobranca ?? '28');
  };

  const marcarWpp = async (id: string) => {
    try { await api.pedidos.wpp(id); } catch { /* silencioso */ }
    setTimeout(load, 400);
  };

  return (
    <section className="admin-section admin-section--active" id="sec-cobran">
      <h2 className="admin-section__title">Cobranças</h2>
      <p className="admin-section__sub">Pagamentos agendados pendentes — clique para abrir o WhatsApp</p>
      <div id="cobrancas-list">
        {cobrancas.length === 0 ? (
          <p className="empty-state"><span aria-hidden="true" className="empty-state__icon">✅</span>Nenhuma cobrança pendente.</p>
        ) : cobrancas.map(p => {
          const wppMsg  = gerarMsg(p);
          const celLimpo = p.cliente_celular.replace(/\D/g, '');
          const wppLink  = `https://wa.me/55${celLimpo}?text=${encodeURIComponent(wppMsg)}`;
          return (
            <article className="cobranca-card" key={p.id}>
              <header className="cobranca-card__head">
                <div className="cobranca-avatar" aria-hidden="true">{iniciais(p.cliente_nome)}</div>
                <div>
                  <p className="cobranca-card__nome">{p.cliente_nome}</p>
                  <p className="cobranca-card__fone">📱 {p.cliente_celular}</p>
                </div>
                <time className="cobranca-card__data">{fmtData(p.criado_em)}</time>
              </header>
              <div className="cobranca-card__body">
                <ul className="cobranca-produtos" aria-label="Produtos do pedido">
                  {p.itens.map((i: any, idx: number) => (
                    <li key={idx} className="cobranca-prod-row">
                      <span>{i.emoji} {i.nome}{i.quantidade > 1 ? ' ×' + i.quantidade : ''}</span>
                      <span>{fmtR(i.preco_unit * i.quantidade)}</span>
                    </li>
                  ))}
                </ul>
                <div className="cobranca-subtotal">
                  <strong>Subtotal</strong>
                  <span className="cobranca-subtotal__val">{fmtR(p.total)}</span>
                </div>
                <a href={wppLink} target="_blank" rel="noopener noreferrer"
                   className={`btn-wpp${p.enviado_wpp ? ' btn-wpp--enviado' : ''}`}
                   onClick={() => marcarWpp(p.id)}>
                  📲 {p.enviado_wpp ? 'Reenviar cobrança' : 'Enviar cobrança pelo WhatsApp'}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Produtos Admin
// ────────────────────────────────────────────────────────────────
function TabProdutos({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', emoji: '', categoria: 'Suplementos' });

  const load = async () => { const r = await api.produtos.listar(); setProdutos(r.dados); };
  useEffect(() => { load().catch(() => toast('Erro ao carregar produtos', 'err')); }, []);

  const abrirNovo = () => {
    setEditId(null);
    setForm({ nome: '', descricao: '', preco: '', emoji: '', categoria: 'Suplementos' });
    setModal(true);
  };

  const editar = (p: any) => {
    setEditId(p.id);
    setForm({ nome: p.nome, descricao: p.descricao, preco: String(p.preco), emoji: p.emoji, categoria: p.categoria });
    setModal(true);
  };

  const deletar = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    try { await api.produtos.remover(id); await load(); toast('Produto excluído', 'ok'); }
    catch { toast('Erro ao excluir produto', 'err'); }
  };

  const salvar = async () => {
    const preco = parseFloat(form.preco);
    if (!form.nome || isNaN(preco)) { toast('Preencha nome e preço', 'err'); return; }
    const body = { nome: form.nome, descricao: form.descricao, preco, emoji: form.emoji || '📦', categoria: form.categoria, ativo: true };
    try {
      if (editId) await api.produtos.atualizar(editId, body);
      else        await api.produtos.criar(body);
      setModal(false);
      await load();
      toast(editId ? 'Produto atualizado' : 'Produto adicionado', 'ok');
    } catch { toast('Erro ao salvar produto', 'err'); }
  };

  return (
    <section className="admin-section admin-section--active" id="sec-produtos">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div><h2 className="admin-section__title">Produtos</h2><p className="admin-section__sub">Gerencie o catálogo</p></div>
        <button className="btn-add-prod" onClick={abrirNovo}>+ Novo produto</button>
      </div>
      <div className="prod-admin-grid" id="prod-admin-grid">
        {produtos.map(p => (
          <article className="prod-admin-card" key={p.id}>
            <div className="prod-admin-card__top">
              <span className="prod-admin-card__emoji" aria-hidden="true">{p.emoji}</span>
              <div>
                <p className="prod-admin-card__nome">{p.nome}</p>
                <p className="prod-admin-card__cat">{p.categoria}</p>
              </div>
            </div>
            <p className="prod-admin-card__preco">{fmtR(p.preco)}</p>
            <p className="prod-admin-card__desc">{p.descricao}</p>
            <footer className="prod-admin-card__actions">
              <button className="btn-edit-prod" onClick={() => editar(p)}>✏ Editar</button>
              <button className="btn-del-prod"  onClick={() => deletar(p.id)} aria-label={`Excluir ${p.nome}`}>🗑</button>
            </footer>
          </article>
        ))}
      </div>

      <div className={`modal-bg${modal ? ' modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Produto" hidden={!modal || undefined}>
        <div className="modal-prod">
          <h2>{editId ? 'Editar produto' : 'Novo produto'}</h2>
          <div className="form-group"><label htmlFor="mp-nome">Nome</label><input type="text" id="mp-nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Whey Protein" /></div>
          <div className="form-group"><label htmlFor="mp-desc">Descrição</label><input type="text" id="mp-desc" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Breve descrição" /></div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="mp-preco">Preço (R$)</label><input type="number" id="mp-preco" value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} step="0.01" min="0" /></div>
            <div className="form-group"><label htmlFor="mp-emoji">Emoji</label><input type="text" id="mp-emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🥤" maxLength={4} /></div>
          </div>
          <div className="form-group">
            <label htmlFor="mp-cat">Categoria</label>
            <select id="mp-cat" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              {['Suplementos','Alimentos','Bebidas','Acessórios','Outros'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn-salvar"   onClick={salvar}>Salvar</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Tab: Config
// ────────────────────────────────────────────────────────────────
function TabConfig({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [form, setForm] = useState<Config>({ pix: '', nome: '', dia_cobranca: '28', template_wpp: '' });

  useEffect(() => {
    api.config.listar()
      .then(r => setForm(r.dados))
      .catch(() => toast('Erro ao carregar configurações', 'err'));
  }, []);

  const salvar = async () => {
    try { await api.config.salvar(form); toast('Configurações salvas!', 'ok'); }
    catch { toast('Erro ao salvar configurações', 'err'); }
  };

  return (
    <section className="admin-section admin-section--active" id="sec-config">
      <h2 className="admin-section__title">Configurações</h2>
      <p className="admin-section__sub">Personalize as informações da academia</p>
      <div className="config-card">
        <h3>Academia</h3>
        <div className="config-row">
          <div className="config-lbl"><strong>Nome da academia</strong><span>Aparece no site</span></div>
          <input className="config-input" type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="config-row">
          <div className="config-lbl"><strong>Chave PIX</strong><span>Checkout e cobranças</span></div>
          <input className="config-input" type="text" value={form.pix} onChange={e => setForm(f => ({ ...f, pix: e.target.value }))} />
        </div>
        <div className="config-row">
          <div className="config-lbl"><strong>Dia de cobrança</strong><span>Dia do mês (1–28)</span></div>
          <input className="config-input" type="number" value={form.dia_cobranca} onChange={e => setForm(f => ({ ...f, dia_cobranca: e.target.value }))} min="1" max="28" />
        </div>
      </div>
      <div className="config-card">
        <h3>Mensagem WhatsApp</h3>
        <div className="config-row config-row--full">
          <div className="config-lbl">
            <strong>Template</strong>
            <span>Use: <code>{'{nome}'}</code> <code>{'{produtos}'}</code> <code>{'{subtotal}'}</code> <code>{'{pix}'}</code> <code>{'{dia}'}</code></span>
          </div>
          <textarea className="config-input config-input--textarea" rows={7} value={form.template_wpp} onChange={e => setForm(f => ({ ...f, template_wpp: e.target.value }))} />
        </div>
      </div>
      <button className="btn-salvar-config" onClick={salvar}>Salvar configurações</button>
    </section>
  );
}
