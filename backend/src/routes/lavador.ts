import { Router } from 'express';
import {
  createLavador,
  getLavadores,
  getLavadoresSimple,
  getLavadorById,
  updateLavador,
  deleteLavador,
  toggleLavadorStatus
} from '../controllers/lavadorController';

const router: Router = Router();

// Rotas de lavadores (todas requerem middleware de multi-empresa)
router.post('/', createLavador);
router.get('/', getLavadores);
router.get('/simple', getLavadoresSimple); // Rota simples para frontend
router.get('/:id', getLavadorById);
router.put('/:id', updateLavador);
router.delete('/:id', deleteLavador);
router.patch('/:id/toggle', toggleLavadorStatus);

export default router;
