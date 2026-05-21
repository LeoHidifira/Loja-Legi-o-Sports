"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routes/index.ts
 * Registra todos os roteadores na aplicação Express.
 */
const express_1 = require("express");
const produtos_routes_1 = __importDefault(require("./produtos.routes"));
const clientes_routes_1 = __importDefault(require("./clientes.routes"));
const pedidos_routes_1 = __importDefault(require("./pedidos.routes"));
const config_routes_1 = __importDefault(require("./config.routes"));
const router = (0, express_1.Router)();
router.use('/produtos', produtos_routes_1.default);
router.use('/clientes', clientes_routes_1.default);
router.use('/pedidos', pedidos_routes_1.default);
router.use('/config', config_routes_1.default);
exports.default = router;
