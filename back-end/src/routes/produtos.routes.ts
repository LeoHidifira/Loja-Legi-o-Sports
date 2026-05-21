/**
 * routes/produtos.routes.ts
 * GET    /api/produtos          → lista produtos ativos (público)
 * POST   /api/produtos          → cria produto (admin)
 * PUT    /api/produtos/:id      → atualiza produto (admin)
 * DELETE /api/produtos/:id      → remove produto (admin, soft delete)
 */
import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, removerProduto } from '../controllers/produtos.controller';
import { authAdmin } from '../middleware/auth';
import { validate }  from '../middleware/validate';
import { ProdutoSchema } from '../schemas';

const router = Router();

router.get('/',     listarProdutos);
router.post('/',    authAdmin, validate(ProdutoSchema), criarProduto);
router.put('/:id',  authAdmin, validate(ProdutoSchema), atualizarProduto);
router.delete('/:id', authAdmin, removerProduto);

export default router;