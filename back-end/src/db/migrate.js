"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * db/migrate.ts
 * Cria todas as tabelas e insere dados padrão.
 * Execute: npm run db:migrate
 */
const client_1 = require("./client");
const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS produtos (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT          NOT NULL,
  descricao  TEXT          NOT NULL DEFAULT '',
  preco      NUMERIC(10,2) NOT NULL,
  emoji      TEXT          NOT NULL DEFAULT '📦',
  categoria  TEXT          NOT NULL DEFAULT 'Outros',
  ativo      BOOLEAN       NOT NULL DEFAULT TRUE,
  criado_em  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  celular    TEXT        NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(celular)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID          NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  total        NUMERIC(10,2) NOT NULL,
  forma_pgto   TEXT          NOT NULL CHECK (forma_pgto IN ('pix','dinheiro','agendado')),
  status_pgto  TEXT          NOT NULL DEFAULT 'pendente' CHECK (status_pgto IN ('pendente','pago')),
  enviado_wpp  BOOLEAN       NOT NULL DEFAULT FALSE,
  criado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   UUID          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id  UUID          REFERENCES produtos(id) ON DELETE SET NULL,
  nome        TEXT          NOT NULL,
  emoji       TEXT          NOT NULL DEFAULT '📦',
  quantidade  INT           NOT NULL DEFAULT 1,
  preco_unit  NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

INSERT INTO configuracoes (chave, valor) VALUES
  ('pix',           'legiaosports@pix.com.br'),
  ('nome',          'Legião Sports'),
  ('dia_cobranca',  '28'),
  ('template_wpp',  'Olá {nome}, tudo bem? 🥋\nPassando para lembrar do pagamento dos produtos consumidos na Legião Sports.\n\nVocê consumiu:\n{produtos}\n\nSubtotal: {subtotal}\n\nPagamento pode ser feito com o professor ou via PIX:\n{pix}\n\nVencimento: dia {dia} do mês.\n\nObrigado e bons treinos! 💪')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO produtos (nome, descricao, preco, emoji, categoria) VALUES
  ('Whey Protein',      'Dose de 30g',               12.00, '🥛', 'Suplementos'),
  ('Barra de Proteína', 'Chocolate/Baunilha',          8.50, '🍫', 'Alimentos'),
  ('Isotônico 500ml',   'Reposição de eletrólitos',    6.00, '🥤', 'Bebidas'),
  ('Creatina',          'Dose 5g',                     5.00, '💊', 'Suplementos'),
  ('Água 500ml',        'Água mineral gelada',          3.00, '💧', 'Bebidas'),
  ('Pré-treino',        'Dose energizante',            10.00, '⚡', 'Suplementos'),
  ('Bandagem',          'Bandagem para mãos 4,5m',    25.00, '🥊', 'Acessórios'),
  ('Amendoim c/ Whey', 'Snack proteico 40g',            7.00, '🥜', 'Alimentos')
ON CONFLICT DO NOTHING;
`;
async function migrate() {
    const client = await client_1.pool.connect();
    try {
        console.log('🔄 Executando migrations...');
        await client.query(SQL);
        console.log('✅ Migrations concluídas com sucesso!');
    }
    catch (err) {
        console.error('❌ Erro na migration:', err);
        process.exit(1);
    }
    finally {
        client.release();
        await client_1.pool.end();
    }
}
migrate();
