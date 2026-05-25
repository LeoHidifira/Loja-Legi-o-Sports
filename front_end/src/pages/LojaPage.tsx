// src/pages/LojaPage.tsx
import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Produto } from '../types';
import { fmtR } from '../utils';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/ui/Navbar';
import Drawer from '../components/ui/Drawer';
import logoHero from '../assets/logo-ls.png';

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [catAtiva, setCatAtiva] = useState('Todos');
  const { addCart } = useCart();
  const toast = useToast();
  const addedRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    api.produtos.listar()
      .then(res => setProdutos(res.dados))
      .catch(() => toast('Erro ao carregar produtos', 'err'));
  }, []);

  const categorias = ['Todos', ...Array.from(new Set(produtos.map(p => p.categoria)))];
  const lista = catAtiva === 'Todos' ? produtos : produtos.filter(p => p.categoria === catAtiva);

  const handleAdd = (produto: Produto, e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    addCart(produto, btn);
    btn.classList.add('btn-add--added');
    clearTimeout(addedRef.current[produto.id]);
    addedRef.current[produto.id] = setTimeout(() => btn.classList.remove('btn-add--added'), 400);
  };

  return (
    <section id="view-loja" className="view view--active" aria-label="Loja de produtos">
      <Navbar />

      <section className="loja-hero" aria-label="Apresentação">
        <div className="loja-hero__txt">
          <span className="hero-tag">Judô &amp; Jiu-Jitsu</span>
          <h1 className="loja-hero__h1">LOJA DA<br /><em>LEGIÃO</em></h1>
          <p className="loja-hero__sub">Suplementos, acessórios e tudo que você precisa para treinar mais forte.</p>
        </div>
        <img src={logoHero} alt="" className="loja-hero__logo" aria-hidden="true" />
      </section>

      <section className="produtos-section" aria-label="Catálogo de produtos">
        <header className="section-label">
          <h2>Produtos</h2>
          <div className="section-line" aria-hidden="true" />
        </header>

        <nav className="cat-bar" id="cat-bar" aria-label="Filtrar por categoria">
          {categorias.map(c => (
            <button
              key={c}
              className={`cat-pill${c === catAtiva ? ' cat-pill--active' : ''}`}
              onClick={() => setCatAtiva(c)}
            >
              {c}
            </button>
          ))}
        </nav>

        <div className="produtos-grid" id="produtos-grid" role="list" aria-label="Lista de produtos">
          {lista.length === 0 ? (
            <p className="empty-state">
              <span className="empty-state__icon" aria-hidden="true">📦</span>
              Nenhum produto nesta categoria.
            </p>
          ) : (
            lista.map(p => (
              <article className="prod-card" key={p.id} role="listitem" aria-label={p.nome}>
                <div className="prod-card__img" aria-hidden="true">
                  <span className="prod-card__cat-badge">{p.categoria}</span>
                  <span className="prod-card__emoji">{p.emoji}</span>
                </div>
                <div className="prod-card__body">
                  <h3 className="prod-card__nome">{p.nome}</h3>
                  <p className="prod-card__desc">{p.descricao}</p>
                  <footer className="prod-card__foot">
                    <span className="prod-card__preco">{fmtR(p.preco)}</span>
                    <button
                      className="btn-add"
                      id={`ba-${p.id}`}
                      onClick={e => handleAdd(p, e)}
                      aria-label={`Adicionar ${p.nome} ao carrinho`}
                    >
                      +
                    </button>
                  </footer>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <Drawer />
    </section>
  );
}
