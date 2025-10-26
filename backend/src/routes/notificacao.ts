import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import {
  getNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from '../controllers/notificacaoController';

const router: Router = Router();

// Todas as rotas de notificação exigem autenticação de empresa
router.get('/', authMiddleware, getNotificacoes);
router.patch('/:id/lida', authMiddleware, marcarComoLida);
router.post('/marcar-todas-lidas', authMiddleware, marcarTodasComoLidas);

export default router;
