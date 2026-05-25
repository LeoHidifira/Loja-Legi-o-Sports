// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fazerLogin = async () => {
    setLoading(true);
    setErro(false);
    try {
      const res = await api.auth.login(senha);
      login(res.token);
      setSenha('');
      navigate('/admin');
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="view-login" className="view view--active" aria-label="Login administrativo">
      <div className="login-box">
        <div className="login-logo">
          <p className="login-logo__text">LEGIÃO SPORTS</p>
          <p className="login-logo__sub">Painel Administrativo</p>
        </div>
        <h1 className="login-box__title">Entrar</h1>
        {erro && <p className="login-err" role="alert">Senha incorreta.</p>}
        <div className="form-group">
          <label htmlFor="login-senha">Senha</label>
          <input
            type="password"
            id="login-senha"
            placeholder="Digite a senha"
            autoComplete="current-password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fazerLogin()}
          />
        </div>
        <button className="btn-login" onClick={fazerLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          className="back-btn"
          style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
          onClick={() => navigate('/')}
        >
          ← Voltar à loja
        </button>
      </div>
    </section>
  );
}
