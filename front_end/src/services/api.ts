// src/services/api.ts
// Espelho exato do api.js original, migrado para TypeScript.

const API_BASE = 'https://loja-legi-o-sports.onrender.com/api';

function getToken(): string {
  return sessionStorage.getItem('ls_token') ?? '';
}

async function req<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem ?? 'Erro na requisição');
  return data as T;
}

export const api = {
  produtos: {
    listar:    ()          => req<any>('GET',    '/produtos'),
    criar:     (body: any) => req<any>('POST',   '/produtos', body),
    atualizar: (id: string, b: any) => req<any>('PUT', `/produtos/${id}`, b),
    remover:   (id: string) => req<any>('DELETE', `/produtos/${id}`),
  },
  pedidos: {
    criar:     (body: any)            => req<any>('POST',  '/pedidos', body),
    listar:    ()                      => req<any>('GET',   '/pedidos'),
    status:    (id: string, s: string) => req<any>('PATCH', `/pedidos/${id}/status`, { status_pgto: s }),
    deletar:   (id: string)            => req<any>('DELETE', `/pedidos/${id}`),
    wpp:       (id: string)            => req<any>('PATCH', `/pedidos/${id}/wpp`),
    cobrancas: ()                      => req<any>('GET',   '/pedidos/cobrancas'),
    dashboard: ()                      => req<any>('GET',   '/pedidos/dashboard'),
  },
  clientes: {
    listar:    ()                       => req<any>('GET',    '/clientes'),
    atualizar: (id: string, b: any)     => req<any>('PUT',    `/clientes/${id}`, b),
    remover:   (id: string)             => req<any>('DELETE', `/clientes/${id}`),
  },
  config: {
    listar: ()          => req<any>('GET', '/config'),
    salvar: (body: any) => req<any>('PUT', '/config', body),
  },
  auth: {
    login: (senha: string) => req<any>('POST', '/config/auth/login', { senha }),
  },
};
