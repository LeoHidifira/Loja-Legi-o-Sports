/**
 * routes/config.routes.ts
 * POST  /api/auth/login   → login do admin (público)
 * GET   /api/config       → lê configurações (admin)
 * PUT   /api/config       → salva configurações (admin)
 */
import { Router } from 'express';
import { listarConfig, salvarConfig, login } from '../controllers/config.controller';
import { authAdmin } from '../middleware/auth';
import { validate }  from '../middleware/validate';
import { ConfigSchema, LoginSchema } from '../schemas';

const router = Router();

router.post('/auth/login', validate(LoginSchema), login);
router.get('/',            authAdmin, listarConfig);
router.put('/',            authAdmin, validate(ConfigSchema), salvarConfig);

export default router;