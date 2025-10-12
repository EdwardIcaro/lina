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
router.get('/:id', getClienteById);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);
router.get('/placa/:placa', getClienteByPlaca);

export default router;
