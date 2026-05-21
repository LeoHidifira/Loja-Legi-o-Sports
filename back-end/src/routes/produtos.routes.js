"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routes/produtos.routes.ts
 * GET    /api/produtos          → lista produtos ativos (público)
 * POST   /api/produtos          → cria produto (admin)
 * PUT    /api/produtos/:id      → atualiza produto (admin)
 * DELETE /api/produtos/:id      → remove produto (admin, soft delete)
 */
const express_1 = require("express");
const produtos_controller_1 = require("../controllers/produtos.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
router.get('/', produtos_controller_1.listarProdutos);
router.post('/', auth_1.authAdmin, (0, validate_1.validate)(schemas_1.ProdutoSchema), produtos_controller_1.criarProduto);
router.put('/:id', auth_1.authAdmin, (0, validate_1.validate)(schemas_1.ProdutoSchema), produtos_controller_1.atualizarProduto);
router.delete('/:id', auth_1.authAdmin, produtos_controller_1.removerProduto);
exports.default = router;
