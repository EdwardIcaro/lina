import { Router } from 'express';
import { createUsuario, authenticateUsuario } from '../controllers/usuarioController';

const router = Router();

// Rota para criar um novo usuário
router.post('/', createUsuario);

// Rota para autenticar (login) um usuário
router.post('/auth', authenticateUsuario);

export default router;