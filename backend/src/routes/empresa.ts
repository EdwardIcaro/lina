import { Router } from 'express';
import {
  createEmpresa,
  getEmpresas,
  getEmpresaById,
  updateEmpresa,
  toggleEmpresaStatus,
} from '../controllers/empresaController';

const router: Router = Router();

// Todas as rotas de empresa agora são protegidas pelo authMiddleware em index.ts
router.post('/', createEmpresa);
router.get('/', getEmpresas);
router.get('/:id', getEmpresaById);
router.put('/:id', updateEmpresa);
router.patch('/:id/status', toggleEmpresaStatus);

export default router;
