/**
 * routes/index.ts
 * Registra todos os roteadores na aplicação Express.
 */
import { Router } from 'express';
import produtosRouter   from './produtos.routes';
import clientesRouter   from './clientes.routes';
import pedidosRouter    from './pedidos.routes';
import configRouter     from './config.routes';

const router = Router();

router.use('/produtos',   produtosRouter);
router.use('/clientes',   clientesRouter);
router.use('/pedidos',    pedidosRouter);
router.use('/config',     configRouter);

export default router;