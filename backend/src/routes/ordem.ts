import { Router } from 'express';
import {
  createOrdem,
  getOrdens,
  getOrdemById,
  updateOrdem,
  cancelOrdem,
  getOrdensStats,
  deleteOrdem
} from '../controllers/ordemController';

const router: Router = Router();

// Rotas de ordens de serviço (todas requerem middleware de multi-empresa)
router.post('/', createOrdem);
router.get('/', getOrdens);
router.get('/stats', getOrdensStats);
router.get('/:id', getOrdemById);
router.put('/:id', updateOrdem);
router.patch('/:id/cancel', cancelOrdem);
router.delete('/:id', deleteOrdem);

export default router;
