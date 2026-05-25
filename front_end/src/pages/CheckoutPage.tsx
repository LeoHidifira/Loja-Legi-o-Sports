// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { fmtR } from '../utils';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

type Pgto = 'pix' | 'dinheiro' | 'agendado';

interface SucessoState { icon: string; titulo: string; msg: string }

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { carrinho, limparCarrinho } = useCart();
  const toast = useToast();

  const [pgto, setPgto] = useState<Pgto>('pix');
  const [loading, setLoading] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixOpen, setPixOpen] = useState(false);
  const [sucesso, setSucesso] = useState<SucessoState | null>(null);

  const total = carrinho.reduce((s, i) => s + Number(i.preco) * i.qty, 0);

  const finalizar = async () => {
    const nome  = (document.getElementById('f-nome')    as HTMLInputElement).value.trim();
    const cel   = (document.getElementById('f-celular') as HTMLInputElement).value.trim();
    const email = (document.getElementById('f-email')   as HTMLInputElement).value.trim();
    if (!nome || !cel || !email) { toast('Preencha todos os dados', 'err'); return; }

    const body = {
      cliente: { nome, email, celular: cel },
      itens: carrinho.map(i => ({
        produto_id: i.id,
        nome: i.nome,
        emoji: i.emoji,
        quantidade: i.qty,
        preco_unit: Number(i.preco),
      })),
      forma_pgto: pgto,
    };

    setLoading(true);
    try {
      const res = await api.pedidos.criar(body);
      const { pix, total: tot, forma_pgto } = res.dados;
      limparCarrinho();
      if (forma_pgto === 'pix') {
        setPixKey(pix);
        setPixOpen(true);
      } else if (forma_pgto === 'dinheiro') {
        setSucesso({ icon: '💵', titulo: 'Pedido registrado!', msg: `Olá ${nome}! Dirija-se ao professor para pagar ${fmtR(tot)}.` });
      } else {
        setSucesso({ icon: '📅', titulo: 'Cobrança agendada!', msg: `Olá ${nome}! Você receberá a cobrança pelo WhatsApp no dia de vencimento.` });
      }
    } catch (err: any) {
      toast(err.message ?? 'Erro ao finalizar pedido', 'err');
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey).then(() => toast('Chave PIX copiada!', 'ok'));
  };

  const fecharPix = () => {
    setPixOpen(false);
    setSucesso({ icon: '✅', titulo: 'Pedido confirmado!', msg: 'Assim que identificarmos o PIX seu pedido será liberado. Bons treinos! 🥋' });
  };

  // ── Tela de sucesso ──
  if (sucesso) {
    return (
      <section id="view-sucesso" className="view view--active" aria-label="Confirmação de pedido">
        <div className="sucesso-box">
          <p className="sucesso-icon" aria-hidden="true">{sucesso.icon}</p>
          <h1>{sucesso.titulo}</h1>
          <p>{sucesso.msg}</p>
          <button className="btn-voltar" onClick={() => navigate('/')}>← Voltar à loja</button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="view-checkout" className="view view--active" aria-label="Finalizar pedido">
        <div className="checkout-wrap">
          <button className="back-btn" onClick={() => navigate('/')}>← Voltar à loja</button>
          <h1 className="checkout-title">Finalizar Pedido</h1>
          <div className="checkout-cols">

            <div className="checkout-left">
              {/* Dados do cliente */}
              <section className="form-card" aria-label="Seus dados">
                <h2 className="form-card__title">Seus dados</h2>
                <div className="form-group">
                  <label htmlFor="f-nome">Nome completo</label>
                  <input type="text" id="f-nome" placeholder="Ex: João Silva" autoComplete="name" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="f-celular">Celular (WhatsApp)</label>
                    <input type="tel" id="f-celular" placeholder="(11) 99999-9999" autoComplete="tel" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="f-email">E-mail</label>
                    <input type="email" id="f-email" placeholder="joao@email.com" autoComplete="email" required />
                  </div>
                </div>
              </section>

              {/* Forma de pagamento */}
              <section className="form-card" aria-label="Forma de pagamento">
                <h2 className="form-card__title">Forma de pagamento</h2>
                <div className="pgto-opts" role="radiogroup" aria-label="Selecione a forma de pagamento">
                  {([
                    { tipo: 'pix'      as Pgto, icon: '💳', label: 'PIX agora',                 sub: 'Chave exibida na tela' },
                    { tipo: 'dinheiro' as Pgto, icon: '💵', label: 'Dinheiro',                  sub: 'Pague com o professor' },
                    { tipo: 'agendado' as Pgto, icon: '📅', label: 'Agendar para o fim do mês', sub: 'Cobrança via WhatsApp' },
                  ]).map(opt => (
                    <div
                      key={opt.tipo}
                      className={`pgto-opt${pgto === opt.tipo ? ' pgto-opt--selected' : ''}`}
                      role="radio"
                      aria-checked={pgto === opt.tipo}
                      tabIndex={0}
                      onClick={() => setPgto(opt.tipo)}
                      onKeyDown={e => e.key === 'Enter' && setPgto(opt.tipo)}
                    >
                      <span className="pgto-radio" aria-hidden="true" />
                      <span className="pgto-icon" aria-hidden="true">{opt.icon}</span>
                      <div className="pgto-info">
                        <strong>{opt.label}</strong>
                        <span>{opt.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Resumo do pedido */}
            <aside className="order-card" aria-label="Resumo do pedido">
              <h2 className="order-card__title">Resumo do pedido</h2>
              <ul className="order-items" aria-label="Itens do pedido">
                {carrinho.map(i => (
                  <li key={i.id} className="order-item">
                    <span className="order-item__nome">{i.emoji} {i.nome} ×{i.qty}</span>
                    <span className="order-item__preco">{fmtR(Number(i.preco) * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <hr className="order-divider" aria-hidden="true" />
              <div className="order-total">
                <strong>Total</strong>
                <span className="order-total__val">{fmtR(total)}</span>
              </div>
              <button className="btn-finalizar" onClick={finalizar} disabled={loading}>
                {loading ? 'Processando...' : 'Confirmar pedido'}
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* Modal PIX */}
      <div className={`modal-bg${pixOpen ? ' modal--open' : ''}`} id="modal-pix"
           role="dialog" aria-modal="true" aria-label="Pagamento via PIX"
           hidden={!pixOpen || undefined}>
        <div className="modal">
          <h2>✅ Pedido confirmado!</h2>
          <p>Realize o pagamento via PIX para concluir seu pedido.</p>
          <p className="pix-tag" aria-hidden="true">Chave PIX</p>
          <p className="pix-box" aria-label="Chave PIX">{pixKey}</p>
          <button className="btn-copy" onClick={copiarPix}>📋 Copiar chave PIX</button>
          <button className="btn-modal-close" onClick={fecharPix}>Fechar</button>
        </div>
      </div>
    </>
  );
}
