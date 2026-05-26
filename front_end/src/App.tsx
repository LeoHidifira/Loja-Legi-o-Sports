// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider }  from './context/ToastContext';
import { CartProvider }   from './context/CartContext';
import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/ui/ProtectedRoute';
import LojaPage           from './pages/LojaPage';
import CheckoutPage       from './pages/CheckoutPage';
import LoginPage          from './pages/LoginPage';
import AdminPage          from './pages/AdminPage';

import './styles/base.css';
import './styles/loja.css';
import './styles/checkout.css';
import './styles/admin.css';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"         element={<LojaPage />}     />
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