# 🚀 Legião Sports — Frontend React: Guia de Instalação

## Pré-requisitos

- **Node.js v18+** → https://nodejs.org (baixe a versão LTS)
- **npm v9+** (já vem junto com o Node)
- Verifique com: `node -v` e `npm -v`

---

## Estrutura de pastas do projeto

```
legiao-sports/
├── back-end/          ← API Express (não muda nada aqui)
│   └── src/ ...
└── front-end/         ← Substitua tudo isso pelo React
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── vite-env.d.ts
        ├── assets/
        │   └── logo-ls.png
        ├── styles/
        │   ├── base.css
        │   ├── loja.css
        │   ├── checkout.css
        │   └── admin.css
        ├── types/
        │   └── index.ts
        ├── utils/
        │   └── index.ts
        ├── services/
        │   └── api.ts
        ├── context/
        │   ├── ToastContext.tsx
        │   ├── CartContext.tsx
        │   └── AuthContext.tsx
        ├── components/
        │   └── ui/
        │       ├── Navbar.tsx
        │       ├── Drawer.tsx
        │       └── ProtectedRoute.tsx
        └── pages/
            ├── LojaPage.tsx
            ├── CheckoutPage.tsx
            ├── LoginPage.tsx
            └── AdminPage.tsx
```

---

## Passo a passo

### 1. Substituir a pasta front-end

Apague o conteúdo da pasta `front-end/` atual e substitua pelos arquivos deste projeto React.

### 2. Instalar dependências

Abra o terminal na pasta `front-end/` e rode:

```bash
npm install
```

Isso instalará automaticamente:

| Pacote                  | Versão   | Para quê                              |
|-------------------------|----------|---------------------------------------|
| react                   | ^18.3    | Framework principal                   |
| react-dom               | ^18.3    | Renderização no browser               |
| react-router-dom        | ^6.26    | Navegação entre páginas (SPA)         |
| vite                    | ^5.4     | Build tool (substitui o servidor HTTP)|
| @vitejs/plugin-react    | ^4.3     | Integração Vite + React               |
| typescript              | ^5.5     | Tipagem estática                      |
| @types/react            | ^18.3    | Tipos TypeScript do React             |
| @types/react-dom        | ^18.3    | Tipos TypeScript do React DOM         |

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5173**

O proxy do Vite (`vite.config.ts`) redireciona `/api/*` para o backend automaticamente em desenvolvimento, sem precisar mudar nada na API.

### 4. Build para produção

```bash
npm run build
```

Os arquivos finais ficam em `front-end/dist/`. Faça deploy dessa pasta (Vercel, Netlify, ou o mesmo servidor do backend).

### 5. Rodar o backend junto (desenvolvimento)

Em outro terminal, na pasta `back-end/`:

```bash
npm run dev
# ou
node src/index.js
```

---

## Variável de ambiente da API

O arquivo `src/services/api.ts` tem a URL do backend:

```ts
const API_BASE = 'https://loja-legi-o-sports.onrender.com/api';
```

Se quiser mudar para desenvolvimento local, crie um `.env` na pasta `front-end/`:

```env
VITE_API_URL=http://localhost:3333/api
```

E atualize `api.ts`:

```ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://loja-legi-o-sports.onrender.com/api';
```

---

## Deploy no Vercel (recomendado para o frontend)

1. Suba o projeto para o GitHub
2. Acesse https://vercel.com e importe o repositório
3. Configure:
   - **Root Directory:** `front-end`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Adicione a variável de ambiente `VITE_API_URL` com a URL do backend no Render

---

## Resumo das rotas

| URL           | Página               |
|---------------|----------------------|
| `/`           | Loja (pública)       |
| `/checkout`   | Finalizar pedido     |
| `/login`      | Login do admin       |
| `/admin`      | Painel admin (protegido — redireciona para `/login` se não autenticado) |
