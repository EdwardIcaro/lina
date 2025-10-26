"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clienteController_1 = require("../controllers/clienteController");
const router = (0, express_1.Router)();
// Rotas de clientes (todas requerem middleware de multi-empresa)
router.post('/', clienteController_1.createCliente);
router.get('/', clienteController_1.getClientes);
router.put('/:id', clienteController_1.updateCliente);
router.delete('/:id', clienteController_1.deleteCliente);
router.get('/veiculo/placa/:placa', clienteController_1.getClienteByPlaca); // Rota corrigida
router.get('/:id', clienteController_1.getClienteById);
exports.default = router;
//# sourceMappingURL=cliente.js.map