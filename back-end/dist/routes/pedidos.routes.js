"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routes/pedidos.routes.ts
 * POST   /api/pedidos                    → cria pedido (público — cliente)
 * GET    /api/pedidos                    → lista todos (admin)
 * PATCH  /api/pedidos/:id/status         → atualiza status pendente/pago (admin)
 * PATCH  /api/pedidos/:id/wpp            → marca como enviado WhatsApp (admin)
 * GET    /api/pedidos/cobrancas          → lista agendados pendentes (admin)
 * GET    /api/pedidos/dashboard          → métricas do dashboard (admin)
 */
const express_1 = require("express");
const pedidos_controller_1 = require("../controllers/pedidos.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
router.post('/', (0, validate_1.validate)(schemas_1.PedidoSchema), pedidos_controller_1.criarPedido);
router.get('/', auth_1.authAdmin, pedidos_controller_1.listarPedidos);
router.patch('/:id/status', auth_1.authAdmin, (0, validate_1.validate)(schemas_1.StatusPedidoSchema), pedidos_controller_1.atualizarStatusPedido);
router.patch('/:id/wpp', auth_1.authAdmin, pedidos_controller_1.marcarEnviadoWpp);
router.get('/cobrancas', auth_1.authAdmin, pedidos_controller_1.listarCobrancas);
router.get('/dashboard', auth_1.authAdmin, pedidos_controller_1.dashboard);
router.delete('/:id', auth_1.authAdmin, pedidos_controller_1.removerPedido);
exports.default = router;
