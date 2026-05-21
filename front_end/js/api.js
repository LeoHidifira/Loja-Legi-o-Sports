/**
 * js/api.js
 * Camada centralizada de comunicação com a API REST.
 * Todas as requisições passam por aqui.
 */

const API_BASE = 'https://loja-legi-o-sports.onrender.com/api'; // ← troque pela URL do Railway/Render

function getToken() {
  return sessionStorage.getItem('ls_token') ?? '';
}

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem ?? 'Erro na requisição');
  return data;
}

/* ── Produtos ── */
export const api = {
  produtos: {
    listar:     ()       => req('GET',    '/produtos'),
    criar:      (body)   => req('POST',   '/produtos', body),
    atualizar:  (id, b)  => req('PUT',    `/produtos/${id}`, b),
    remover:    (id)     => req('DELETE', `/produtos/${id}`),
  },
  pedidos: {
    criar:      (body)   => req('POST',   '/pedidos', body),
    listar:     ()       => req('GET',    '/pedidos'),
    status:     (id, s)  => req('PATCH',  `/pedidos/${id}/status`, { status_pgto: s }),
    wpp:        (id)     => req('PATCH',  `/pedidos/${id}/wpp`),
    cobrancas:  ()       => req('GET',    '/pedidos/cobrancas'),
    dashboard:  ()       => req('GET',    '/pedidos/dashboard'),
  },
  clientes: {
    listar:     ()       => req('GET',    '/clientes'),
    atualizar:  (id, b)  => req('PUT',    `/clientes/${id}`, b),
    remover:    (id)     => req('DELETE', `/clientes/${id}`),
  },
  config: {
    listar:     ()       => req('GET',    '/config'),
    salvar:     (body)   => req('PUT',    '/config', body),
  },
  auth: {
    login:      (senha)  => req('POST',   '/config/auth/login', { senha }),
  },
};