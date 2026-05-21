"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routes/clientes.routes.ts
 * GET    /api/clientes          → lista clientes (admin)
 * PUT    /api/clientes/:id      → edita cliente (admin)
 * DELETE /api/clientes/:id      → remove cliente (admin)
 */
const express_1 = require("express");
const clientes_controller_1 = require("../controllers/clientes.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
router.get('/', auth_1.authAdmin, clientes_controller_1.listarClientes);
router.put('/:id', auth_1.authAdmin, (0, validate_1.validate)(schemas_1.ClienteSchema), clientes_controller_1.atualizarCliente);
router.delete('/:id', auth_1.authAdmin, clientes_controller_1.removerCliente);
exports.default = router;
