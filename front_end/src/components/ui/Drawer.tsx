// src/components/ui/Drawer.tsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fmtR } from '../../utils';

export default function Drawer() {
  const { carrinho, changeQty, removeItem, total, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`overlay${drawerOpen ? ' overlay--open' : ''}`}
        id="overlay"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside className={`drawer${drawerOpen ? ' drawer--open' : ''}`} aria-label="Carrinho de compras">
        <header className="drawer__head">
          <h2>🛒 Carrinho</h2>
          <button className="btn-close" onClick={() => setDrawerOpen(false)} aria-label="Fechar carrinho">×</button>
        </header>

        <div className="drawer__body" id="drawer-body">
          {carrinho.length === 0 ? (
            <p className="cart-empty">
              <span aria-hidden="true" className="cart-empty__icon">🛒</span>
              Seu carrinho está vazio.
            </p>
          ) : (
            carrinho.map(i => (
              <article className="cart-item" key={i.id} aria-label={i.nome}>
                <span className="cart-item__emoji" aria-hidden="true">{i.emoji}</span>
                <div className="cart-item__info">
                  <p className="cart-item__nome">{i.nome}</p>
                  <p className="cart-item__price">{fmtR(Number(i.preco) * i.qty)}</p>
                  <div className="cart-item__qty" role="group" aria-label="Quantidade">
                    <button className="qty-btn" onClick={() => changeQty(i.id, -1)} aria-label="Diminuir">−</button>
                    <span className="qty-val" aria-live="polite">{i.qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(i.id, 1)}  aria-label="Aumentar">+</button>
                  </div>
                </div>
                <button className="btn-rm-item" onClick={() => removeItem(i.id)} aria-label={`Remover ${i.nome}`}>×</button>
              </article>
            ))
          )}
        </div>

        <footer className="drawer__footer">
          <div className="cart-total-row">
            <span className="cart-total-lbl">Total</span>
            <span className="cart-total-val" id="cart-total" aria-live="polite">{fmtR(total)}</span>
          </div>
          <button
            className="btn-checkout"
            id="btn-checkout"
            onClick={handleCheckout}
            disabled={carrinho.length === 0}
          >
            Finalizar compra →
          </button>
        </footer>
      </aside>
    </>
  );
}
