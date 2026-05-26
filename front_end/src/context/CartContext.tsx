// src/context/CartContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { ItemCarrinho, Produto } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  carrinho: ItemCarrinho[];
  addCart: (produto: Produto, originEl?: HTMLElement | null) => void;
  changeQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  limparCarrinho: () => void;
  total: number;
  qtd: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const total = carrinho.reduce((s, i) => s + Number(i.preco) * i.qty, 0);
  const qtd   = carrinho.reduce((s, i) => s + i.qty, 0);

  function flyToCart(originEl: HTMLElement) {
    const cartBtn = document.querySelector('.btn-cart') as HTMLElement;
    if (!cartBtn) return;

    const originRect = originEl.getBoundingClientRect();
    const cartRect   = cartBtn.getBoundingClientRect();

    const fly = document.createElement('span');
    fly.className   = 'fly-emoji';
    fly.textContent = (originEl.closest('article')?.querySelector('.prod-card__emoji') as HTMLElement)?.textContent ?? '📦';
    fly.style.cssText = `
      position:fixed;
      left:${originRect.left + originRect.width / 2}px;
      top:${originRect.top + originRect.height / 2}px;
      font-size:1.6rem;pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%) scale(1);transition:none;
    `;
    document.body.appendChild(fly);
    fly.getBoundingClientRect(); // force reflow

    const dx = (cartRect.left + cartRect.width / 2)  - (originRect.left + originRect.width / 2);
    const dy = (cartRect.top  + cartRect.height / 2) - (originRect.top  + originRect.height / 2);
    fly.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease';
    fly.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`;
    fly.style.opacity    = '0.15';

    fly.addEventListener('transitionend', () => {
      fly.remove();
      const badge = document.getElementById('cart-badge');
      if (badge) {
        badge.classList.add('cart-badge--pulse');
        setTimeout(() => badge.classList.remove('cart-badge--pulse'), 400);
      }
    }, { once: true });
  }

  const addCart = (produto: Produto, originEl?: HTMLElement | null) => {
    setCarrinho(prev => {
      const ex = prev.find(x => x.id === produto.id);
      if (ex) return prev.map(x => x.id === produto.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...produto, qty: 1 }];
    });
    if (originEl) flyToCart(originEl);
    toast(`${produto.emoji} ${produto.nome} adicionado ao carrinho!`, 'ok');
  };

  const changeQty = (id: string, delta: number) => {
    setCarrinho(prev => {
      const item = prev.find(x => x.id === id);
      if (!item) return prev;
      if (item.qty + delta <= 0) return prev.filter(x => x.id !== id);
      return prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x);
    });
  };

  const removeItem     = (id: string) => setCarrinho(prev => prev.filter(x => x.id !== id));
  const limparCarrinho = ()           => setCarrinho([]);

  return (
    <CartContext.Provider value={{ carrinho, addCart, changeQty, removeItem, limparCarrinho, total, qtd, drawerOpen, setDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}