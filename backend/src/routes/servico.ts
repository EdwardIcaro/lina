import { Router } from 'express';
import {
  createServico,
  createAdicional,
  getServicos,
  getServicosSimple,
  getAdicionaisSimple,
  getAdicionais,
  getServicoById,
  getAdicionalById,
  updateServico,
  updateAdicional,
  deleteServico,
  deleteAdicional
} from '../controllers/servicoController';

const router: Router = Router();

// Rotas de serviços adicionais (ex: /api/servicos/adicionais)
router.post('/adicionais', createAdicional);
router.get('/adicionais/simple', getAdicionaisSimple);
router.get('/adicionais', getAdicionais);
router.get('/adicionais/:id', getAdicionalById);
router.put('/adicionais/:id', updateAdicional);
router.delete('/adicionais/:id', deleteAdicional);

// Rotas de serviços principais (ex: /api/servicos)
router.post('/', createServico);
router.get('/', getServicos);
router.get('/simple', getServicosSimple); // Rota simples para frontend
router.get('/:id', getServicoById);
router.put('/:id', updateServico);
router.delete('/:id', deleteServico);

export default router;
