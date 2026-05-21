/**
 * routes/pedidos.routes.ts
 * POST   /api/pedidos                    → cria pedido (público — cliente)
 * GET    /api/pedidos                    → lista todos (admin)
 * PATCH  /api/pedidos/:id/status         → atualiza status pendente/pago (admin)
 * PATCH  /api/pedidos/:id/wpp            → marca como enviado WhatsApp (admin)
 * GET    /api/pedidos/cobrancas          → lista agendados pendentes (admin)
 * GET    /api/pedidos/dashboard          → métricas do dashboard (admin)
 */
import { Router } from 'express';
import {
  listarPedidos,
  criarPedido,
  atualizarStatusPedido,
  marcarEnviadoWpp,
  listarCobrancas,
  dashboard,
} from '../controllers/pedidos.controller';
import { authAdmin } from '../middleware/auth';
import { validate }  from '../middleware/validate';
import { PedidoSchema, StatusPedidoSchema } from '../schemas';

const router = Router();

router.post('/',                  validate(PedidoSchema), criarPedido);
router.get('/',                   authAdmin, listarPedidos);
router.patch('/:id/status',       authAdmin, validate(StatusPedidoSchema), atualizarStatusPedido);
router.patch('/:id/wpp',          authAdmin, marcarEnviadoWpp);
router.get('/cobrancas',          authAdmin, listarCobrancas);
router.get('/dashboard',          authAdmin, dashboard);

export default router;