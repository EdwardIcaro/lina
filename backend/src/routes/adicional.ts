import { Router } from 'express';
import { createAdicional, getAdicionais, getAdicionaisSimple, updateAdicional, deleteAdicional } from '../controllers/adicionalController';

const router: Router = Router();

router.get('/', getAdicionais);
router.get('/simple', getAdicionaisSimple);
router.post('/', createAdicional);
router.put('/:id', updateAdicional);
router.delete('/:id', deleteAdicional);

export default router;