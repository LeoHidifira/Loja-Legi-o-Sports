/**
 * routes/clientes.routes.ts
 * GET    /api/clientes          → lista clientes (admin)
 * PUT    /api/clientes/:id      → edita cliente (admin)
 * DELETE /api/clientes/:id      → remove cliente (admin)
 */
import { Router } from 'express';
import { listarClientes, atualizarCliente, removerCliente } from '../controllers/clientes.controller';
import { authAdmin } from '../middleware/auth';
import { validate }  from '../middleware/validate';
import { ClienteSchema } from '../schemas';

const router = Router();

router.get('/',       authAdmin, listarClientes);
router.put('/:id',    authAdmin, validate(ClienteSchema), atualizarCliente);
router.delete('/:id', authAdmin, removerCliente);

export default router;