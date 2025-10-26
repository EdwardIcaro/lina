import { Router } from 'express';
import {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente,
  getClienteByPlaca
} from '../controllers/clienteController';

const router: Router = Router();

// Rotas de clientes (todas requerem middleware de multi-empresa)
router.post('/', createCliente);
router.get('/', getClientes);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);
router.get('/veiculo/placa/:placa', getClienteByPlaca); // Rota corrigida
router.get('/:id', getClienteById);

export default router;
