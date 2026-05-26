# 🥋 Legião Sports — Sistema de Loja

> Plataforma de e-commerce interna para academia de Judô e Jiu-Jitsu. Permite que alunos façam pedidos de suplementos e acessórios diretamente pelo celular, e que o administrador gerencie tudo em um painel dedicado.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Demonstração](#demonstração)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API — Referência Completa](#api--referência-completa)
- [Banco de Dados](#banco-de-dados)
- [Deploy](#deploy)
- [Guia de Uso](#guia-de-uso)
- [Contribuindo](#contribuindo)

---

## Visão Geral

O sistema é dividido em duas partes independentes:

| Parte | Tecnologia | Responsabilidade |
|---|---|---|
| **Back-end** | Node.js + Express + TypeScript | API REST + autenticação + banco de dados |
| **Front-end** | React + Vite + TypeScript | Interface do aluno e painel administrativo |

O aluno acessa a loja, adiciona produtos ao carrinho e finaliza o pedido escolhendo entre PIX, dinheiro ou cobrança agendada via WhatsApp. O administrador gerencia produtos, visualiza pedidos, confirma pagamentos, cobra clientes pelo WhatsApp e configura a academia — tudo em um painel protegido por senha.

---

## Demonstração

```
Loja pública   →  https://seu-dominio.vercel.app/
Painel admin   →  https://seu-dominio.vercel.app/admin
API            →  https://sua-api.onrender.com/api
```

---

## Funcionalidades

### 👤 Área do Aluno (pública)

- **Catálogo de produtos** com filtro por categoria (Suplementos, Alimentos, Bebidas, Acessórios)
- **Carrinho lateral** (drawer) com controle de quantidade e remoção de itens
- **Animação** de item voando para o carrinho ao adicionar produto
- **Toast de confirmação** ao adicionar item
- **Checkout** com 3 formas de pagamento:
  - **PIX** — chave exibida na tela com botão de copiar
  - **Dinheiro** — pagamento presencial com o professor
  - **Agendado** — cobrança via WhatsApp no dia configurado
- **Tela de sucesso** personalizada por forma de pagamento

### 🔐 Painel Administrativo (protegido por senha)

- **Dashboard** com métricas: total de pedidos, clientes, valor recebido e a receber
- **Pedidos** — tabela completa com busca, troca de status (pendente → pago) e exclusão de pedidos pagos
- **Clientes** — listagem com total gasto, edição e remoção
- **Cobranças** — pedidos agendados pendentes com link direto para WhatsApp com mensagem pré-formatada
- **Produtos** — CRUD completo do catálogo
- **Configurações** — chave PIX, nome da academia, dia de cobrança e template de mensagem WhatsApp
- **Exportação CSV** de pedidos e clientes

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                   │
│                                                         │
│   React SPA (Vite)                                      │
│   ├── / → LojaPage (público)                            │
│   ├── /checkout → CheckoutPage (público)                │
│   ├── /login → LoginPage (público)                      │
│   └── /admin → AdminPage (protegido)                    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────────┐
│                   BACK-END (Express)                    │
│                                                         │
│   Middleware: CORS → JSON Parser → authAdmin            │
│   Rotas:                                                │
│   ├── /api/produtos   (público: GET / admin: POST,PUT,DELETE) │
│   ├── /api/pedidos    (público: POST / admin: GET,PATCH,DELETE) │
│   ├── /api/clientes   (admin: GET,PUT,DELETE)           │
│   ├── /api/config     (admin: GET,PUT)                  │
│   └── /api/config/auth/login  (público: POST)           │
└──────────────────────┬──────────────────────────────────┘
                       │ pg Pool (SSL)
┌──────────────────────▼──────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL)                │
│              Supabase / Neon / Render Postgres          │
│                                                         │
│   produtos · clientes · pedidos · itens_pedido          │
│   configuracoes                                         │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de autenticação

```
1. Admin clica "Admin" no header
2. Frontend → POST /api/config/auth/login { senha }
3. Backend compara com ADMIN_PASSWORD (env var)
4. Retorna { token: ADMIN_TOKEN }
5. Frontend armazena em sessionStorage
6. Todas as requisições admin enviam: Authorization: Bearer <token>
7. Middleware authAdmin valida o token antes de cada rota protegida
```

---

## Stack Tecnológica

### Back-end

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | v18+ | Runtime |
| Express | ^4.x | Framework HTTP |
| TypeScript | ^5.x | Tipagem estática |
| PostgreSQL (pg) | ^8.x | Banco de dados |
| Zod | ^3.x | Validação de schemas |
| dotenv | ^16.x | Variáveis de ambiente |
| cors | ^2.x | Cross-Origin Resource Sharing |

### Front-end

| Tecnologia | Versão | Uso |
|---|---|---|
| React | ^18.3 | Framework UI |
| Vite | ^5.4 | Build tool / Dev server |
| TypeScript | ^5.5 | Tipagem estática |
| React Router DOM | ^6.26 | Roteamento SPA |

### Infraestrutura (recomendada)

| Serviço | Para quê |
|---|---|
| **Render** | Hospedagem do back-end (Node.js) |
| **Supabase / Neon** | Banco de dados PostgreSQL gerenciado |
| **Vercel** | Hospedagem do front-end (React) |

---

## Estrutura de Pastas

```
legiao-sports/
│
├── back-end/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── clientes.controller.ts   # CRUD de clientes
│   │   │   ├── config.controller.ts     # Configurações + login
│   │   │   ├── pedidos.controller.ts    # Pedidos + dashboard
│   │   │   └── produtos.controller.ts   # CRUD de produtos
│   │   ├── db/
│   │   │   ├── client.ts                # Pool de conexão PostgreSQL
│   │   │   └── migrate.ts               # Criação de tabelas + seed
│   │   ├── middleware/
│   │   │   ├── auth.ts                  # Validação do token admin
│   │   │   └── validate.ts              # Validação de body com Zod
│   │   ├── routes/
│   │   │   ├── clientes.routes.ts
│   │   │   ├── config.routes.ts
│   │   │   ├── pedidos.routes.ts
│   │   │   ├── produtos.routes.ts
│   │   │   └── index.ts                 # Agrega todos os roteadores
│   │   ├── schemas/
│   │   │   └── index.ts                 # Schemas Zod + tipos TypeScript
│   │   └── index.ts                     # Entry point — Express app
│   ├── dist/                            # Build compilado (gerado por tsc)
│   ├── .env                             # Variáveis de ambiente (não commitar)
│   ├── .env.example                     # Exemplo de variáveis
│   ├── package.json
│   ├── tsconfig.json
│   └── render.yaml                      # Config de deploy no Render
│
└── front-end/
    ├── src/
    │   ├── assets/
    │   │   └── logo-ls.png
    │   ├── context/
    │   │   ├── AuthContext.tsx           # Token de sessão do admin
    │   │   ├── CartContext.tsx           # Estado global do carrinho
    │   │   └── ToastContext.tsx          # Notificações globais
    │   ├── components/
    │   │   └── ui/
    │   │       ├── Drawer.tsx            # Carrinho lateral
    │   │       ├── Navbar.tsx            # Cabeçalho da loja
    │   │       └── ProtectedRoute.tsx    # Guard de rota admin
    │   ├── pages/
    │   │   ├── AdminPage.tsx             # Painel administrativo completo
    │   │   ├── CheckoutPage.tsx          # Checkout + PIX modal + sucesso
    │   │   ├── LoginPage.tsx             # Login do admin
    │   │   └── LojaPage.tsx              # Loja pública
    │   ├── services/
    │   │   └── api.ts                    # Camada de comunicação com a API
    │   ├── styles/
    │   │   ├── admin.css
    │   │   ├── base.css
    │   │   ├── checkout.css
    │   │   └── loja.css
    │   ├── types/
    │   │   └── index.ts                  # Tipos TypeScript globais
    │   ├── utils/
    │   │   └── index.ts                  # Funções utilitárias
    │   ├── App.tsx                       # Roteador principal
    │   ├── main.tsx                      # Entry point React
    │   └── vite-env.d.ts
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Instalação e Configuração

### Pré-requisitos

- **Node.js v18+** → https://nodejs.org
- **npm v9+** (incluído com o Node)
- Banco de dados **PostgreSQL** (Supabase, Neon ou local)

Verifique sua versão:
```bash
node -v   # deve ser v18.x ou superior
npm -v    # deve ser v9.x ou superior
```

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/legiao-sports.git
cd legiao-sports
```

---

### 2. Configure o Back-end

```bash
cd back-end
npm install
```

Crie o arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

Execute a migration para criar as tabelas e inserir dados iniciais:

```bash
npm run db:migrate
```

Inicie o servidor:

```bash
npm run dev       # desenvolvimento (com hot-reload)
npm run build     # compila TypeScript
npm start         # produção (roda o dist/)
```

O servidor sobe em `http://localhost:3333`.

---

### 3. Configure o Front-end

```bash
cd ../front-end
npm install
```

Se quiser apontar para uma API local, crie um `.env`:

```bash
# front-end/.env
VITE_API_URL=http://localhost:3333/api
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:5173`.

Para gerar o build de produção:

```bash
npm run build     # gera a pasta dist/
npm run preview   # previsualiza o build localmente
```

---

## Variáveis de Ambiente

### Back-end (`back-end/.env`)

```env
# ── Banco de dados ──────────────────────────────────────────
# Copie de: Supabase → Project Settings → Database → URI
DATABASE_URL=postgresql://usuario:senha@host:5432/banco?sslmode=require

# ── Servidor ────────────────────────────────────────────────
PORT=3333

# ── Autenticação admin ──────────────────────────────────────
# Senha que o admin digita na tela de login
ADMIN_PASSWORD=sua-senha-segura

# Token fixo retornado após login bem-sucedido
# Use uma string longa e aleatória em produção
ADMIN_TOKEN=seu-token-secreto-longo

# ── CORS ────────────────────────────────────────────────────
# URLs do frontend separadas por vírgula
ALLOWED_ORIGINS=https://seu-dominio.vercel.app,http://localhost:5173
```

### Front-end (`front-end/.env`) — opcional

```env
# URL da API (padrão: URL do Render hardcoded em api.ts)
VITE_API_URL=https://sua-api.onrender.com/api
```

> **⚠️ Nunca suba o arquivo `.env` para o Git.** Ele já está no `.gitignore`.

---

## API — Referência Completa

**Base URL:** `https://sua-api.onrender.com/api`

Rotas marcadas com 🔒 exigem o header:
```
Authorization: Bearer <ADMIN_TOKEN>
```

---

### Autenticação

#### `POST /config/auth/login`
Autentica o administrador.

**Body:**
```json
{ "senha": "sua-senha" }
```

**Resposta 200:**
```json
{ "sucesso": true, "token": "seu-admin-token" }
```

**Resposta 401:**
```json
{ "sucesso": false, "mensagem": "Senha incorreta" }
```

---

### Produtos

#### `GET /produtos` — público
Retorna todos os produtos ativos ordenados por categoria.

**Resposta 200:**
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": "uuid",
      "nome": "Whey Protein",
      "descricao": "Dose de 30g",
      "preco": "12.00",
      "emoji": "🥛",
      "categoria": "Suplementos",
      "ativo": true,
      "criado_em": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /produtos` 🔒
Cria um novo produto.

**Body:**
```json
{
  "nome": "Whey Protein",
  "descricao": "Dose de 30g",
  "preco": 12.00,
  "emoji": "🥛",
  "categoria": "Suplementos",
  "ativo": true
}
```

Categorias válidas: `Suplementos` · `Alimentos` · `Bebidas` · `Acessórios` · `Outros`

#### `PUT /produtos/:id` 🔒
Atualiza um produto existente. Body igual ao POST.

#### `DELETE /produtos/:id` 🔒
Soft delete — marca o produto como `ativo = false` para preservar histórico nos pedidos.

---

### Pedidos

#### `POST /pedidos` — público
Cria um pedido. Realiza upsert automático do cliente por e-mail.

**Body:**
```json
{
  "cliente": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "celular": "11999999999"
  },
  "itens": [
    {
      "produto_id": "uuid-opcional",
      "nome": "Whey Protein",
      "emoji": "🥛",
      "quantidade": 2,
      "preco_unit": 12.00
    }
  ],
  "forma_pgto": "pix"
}
```

Formas de pagamento válidas: `pix` · `dinheiro` · `agendado`

**Resposta 201:**
```json
{
  "sucesso": true,
  "dados": {
    "pedido_id": "uuid",
    "cliente_id": "uuid",
    "total": 24.00,
    "forma_pgto": "pix",
    "pix": "legiaosports@pix.com.br"
  }
}
```

#### `GET /pedidos` 🔒
Lista todos os pedidos com dados do cliente e itens.

#### `PATCH /pedidos/:id/status` 🔒
Atualiza o status de pagamento.

**Body:**
```json
{ "status_pgto": "pago" }
```

#### `DELETE /pedidos/:id` 🔒
Exclui um pedido **somente se** `status_pgto = 'pago'`. Retorna 404 se pendente.

#### `PATCH /pedidos/:id/wpp` 🔒
Marca o pedido como enviado pelo WhatsApp (`enviado_wpp = true`).

#### `GET /pedidos/cobrancas` 🔒
Lista pedidos com `forma_pgto = 'agendado'` e `status_pgto = 'pendente'`.

#### `GET /pedidos/dashboard` 🔒
Retorna métricas consolidadas.

**Resposta 200:**
```json
{
  "sucesso": true,
  "dados": {
    "total_pedidos": 42,
    "total_clientes": 18,
    "total_recebido": 1250.00,
    "total_agendado": 340.00
  }
}
```

---

### Clientes

#### `GET /clientes` 🔒
Lista todos os clientes com contagem de pedidos e total gasto.

#### `PUT /clientes/:id` 🔒
Atualiza nome, email e celular do cliente.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "celular": "11999999999"
}
```

#### `DELETE /clientes/:id` 🔒
Remove o cliente e todos os seus pedidos (cascade).

---

### Configurações

#### `GET /config` 🔒
Retorna as configurações da academia.

**Resposta 200:**
```json
{
  "sucesso": true,
  "dados": {
    "pix": "legiaosports@pix.com.br",
    "nome": "Legião Sports",
    "dia_cobranca": "28",
    "template_wpp": "Olá {nome}..."
  }
}
```

#### `PUT /config` 🔒
Salva as configurações. Body com os mesmos campos da resposta acima.

O template WhatsApp aceita as variáveis: `{nome}` · `{produtos}` · `{subtotal}` · `{pix}` · `{dia}`

---

### Health Check

#### `GET /health` — público
```json
{ "status": "ok", "timestamp": "2024-01-01T12:00:00Z" }
```

---

## Banco de Dados

### Diagrama de entidades

```
┌──────────────┐       ┌──────────────────┐       ┌───────────────┐
│   clientes   │       │     pedidos      │       │  itens_pedido │
│──────────────│       │──────────────────│       │───────────────│
│ id (PK)      │──┐    │ id (PK)          │──┐    │ id (PK)       │
│ nome         │  └──► │ cliente_id (FK)  │  └──► │ pedido_id(FK) │
│ email        │       │ total            │        │ produto_id(FK)│
│ celular      │       │ forma_pgto       │        │ nome          │
│ criado_em    │       │ status_pgto      │        │ emoji         │
└──────────────┘       │ enviado_wpp      │        │ quantidade    │
                       │ criado_em        │        │ preco_unit    │
                       └──────────────────┘        └───────────────┘

┌───────────────┐       ┌───────────────────┐
│   produtos    │       │  configuracoes    │
│───────────────│       │───────────────────│
│ id (PK)       │       │ chave (PK)        │
│ nome          │       │ valor             │
│ descricao     │       └───────────────────┘
│ preco         │
│ emoji         │
│ categoria     │
│ ativo         │
│ criado_em     │
└───────────────┘
```

### Regras de negócio no banco

- `pedidos.forma_pgto` → `CHECK IN ('pix', 'dinheiro', 'agendado')`
- `pedidos.status_pgto` → `CHECK IN ('pendente', 'pago')`, default `'pendente'`
- `clientes.email` → `UNIQUE`
- `clientes.celular` → `UNIQUE`
- Deletar cliente → deleta pedidos em cascade (`ON DELETE CASCADE`)
- Deletar pedido → deleta itens em cascade (`ON DELETE CASCADE`)
- Deletar produto → itens históricos mantidos com `produto_id = NULL` (`ON DELETE SET NULL`)

### Executar a migration

```bash
cd back-end
npm run db:migrate
```

Isso cria todas as tabelas e insere 8 produtos e as configurações padrão. É seguro rodar novamente (usa `IF NOT EXISTS` e `ON CONFLICT DO NOTHING`).

---

## Deploy

### Back-end no Render

1. Crie um novo **Web Service** no [Render](https://render.com)
2. Conecte seu repositório GitHub
3. Configure:
   - **Root Directory:** `back-end`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
4. Adicione as variáveis de ambiente (`DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS`)
5. Após o deploy, rode a migration uma vez pelo shell do Render:
   ```bash
   node dist/db/migrate.js
   ```

O projeto inclui `render.yaml` para configuração automática.

### Front-end no Vercel

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Configure:
   - **Root Directory:** `front-end`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Adicione a variável de ambiente `VITE_API_URL` com a URL do Render
4. Clique em **Deploy**

### Banco de dados no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Project Settings → Database → Connection string (URI)**
3. Copie a URI e cole em `DATABASE_URL` no `.env` do back-end
4. Execute a migration

---

## Guia de Uso

### Para o aluno

1. Acesse o site
2. Navegue pelo catálogo, filtre por categoria
3. Clique **+** para adicionar ao carrinho
4. Clique no ícone 🛒 para abrir o carrinho
5. Clique **Finalizar compra**
6. Preencha nome, celular e e-mail
7. Escolha a forma de pagamento e confirme

### Para o administrador

1. Clique em **⚙ Admin** no canto superior direito
2. Digite a senha e clique em **Entrar**
3. Use o menu lateral para navegar entre as seções:
   - **Dashboard** — visão geral dos números
   - **Pedidos** — gerencie e confirme pagamentos
   - **Clientes** — edite ou remova clientes
   - **Cobranças** — envie cobranças pelo WhatsApp
   - **Produtos** — adicione, edite ou remova produtos
   - **Config** — configure a academia

---

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

### Padrão de commits

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
style:    formatação (sem mudança de lógica)
refactor: refatoração de código
chore:    tarefas de build/config
```

---

## Licença

Este projeto é de uso privado da **Legião Sports**. Todos os direitos reservados.


