// src/components/ui/Navbar.tsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import logoImg from '../../assets/logo-ls.png';

export default function Navbar() {
  const { qtd, total, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  return (
    <header className="loja-nav" role="banner">
      <div className="loja-nav__brand">
        <img src={logoImg} alt="Legião Sports" className="logo-img" style={{ width: 34, height: 34 }} />
        <div className="logo-text" aria-label="Legião Sports">
          <span className="logo-text__leg">LEGIÃO</span>
          <span className="logo-text__sports">SPORTS</span>
        </div>
      </div>
      <nav className="loja-nav__actions" aria-label="Ações do cabeçalho">
        <button className="btn-admin-link" onClick={() => navigate('/login')} aria-label="Acesso administrativo">
          ⚙ Admin
        </button>
        <button className="btn-cart" onClick={() => setDrawerOpen(true)} aria-label="Abrir carrinho">
          🛒 <span className="btn-cart__label">Carrinho</span>
          <span className="cart-badge" id="cart-badge" aria-live="polite">{qtd}</span>
        </button>
      </nav>
    </header>
  );
}
