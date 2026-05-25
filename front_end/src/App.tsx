// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { ToastProvider } from './context/ToastContext';
import { CartProvider }  from './context/CartContext';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ui/ProtectedRoute';
import LojaPage          from './pages/LojaPage';
import CheckoutPage      from './pages/CheckoutPage';
import LoginPage         from './pages/LoginPage';
import AdminPage         from './pages/AdminPage';

import './styles/base.css';
import './styles/loja.css';
import './styles/checkout.css';
import './styles/admin.css';

export default function App() {
  // CartProvider precisa do toast, mas ToastProvider está acima — usamos um bridge
  const [toastFn, setToastFn] = useState<(m: string, t?: 'ok'|'err') => void>(() => () => {});

  return (
    <ToastProvider>
      <ToastBridge onReady={setToastFn} />
      <AuthProvider>
        <CartProvider onToast={(m) => toastFn(m, 'ok')}>
          <BrowserRouter>
            <Routes>
              <Route path="/"        element={<LojaPage />}     />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login"    element={<LoginPage />}    />
              <Route path="/admin"    element={
                <ProtectedRoute><AdminPage /></ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

// Helper para capturar a função de toast do contexto e passá-la para CartProvider
import { useToast } from './context/ToastContext';
function ToastBridge({ onReady }: { onReady: (fn: (m: string, t?: 'ok'|'err') => void) => void }) {
  const toast = useToast();
  // executa apenas na montagem
  useState(() => { onReady(toast); });
  return null;
}
