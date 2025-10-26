import { Router } from 'express';
import { getFornecedores } from '../controllers/fornecedorController';

const router: Router = Router();

router.get('/', getFornecedores);

export default router;