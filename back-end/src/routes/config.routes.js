"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * routes/config.routes.ts
 * POST  /api/auth/login   → login do admin (público)
 * GET   /api/config       → lê configurações (admin)
 * PUT   /api/config       → salva configurações (admin)
 */
const express_1 = require("express");
const config_controller_1 = require("../controllers/config.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const router = (0, express_1.Router)();
router.post('/auth/login', (0, validate_1.validate)(schemas_1.LoginSchema), config_controller_1.login);
router.get('/', auth_1.authAdmin, config_controller_1.listarConfig);
router.put('/', auth_1.authAdmin, (0, validate_1.validate)(schemas_1.ConfigSchema), config_controller_1.salvarConfig);
exports.default = router;
