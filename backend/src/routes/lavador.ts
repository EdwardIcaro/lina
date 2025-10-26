import { Router } from 'express';
import { 
    createLavador, 
    getLavadores, 
    updateLavador, 
    deleteLavador, 
    gerarTokenPublico,
    getLavadoresSimple
} from '../controllers/lavadorController';

const router: Router = Router();

router.get('/', getLavadores);
router.get('/simple', getLavadoresSimple); // <-- Rota que estava faltando
router.post('/', createLavador);
router.put('/:id', updateLavador);
router.delete('/:id', deleteLavador);
router.get('/:id/token', gerarTokenPublico); // <-- Rota que estava faltando

export default router;