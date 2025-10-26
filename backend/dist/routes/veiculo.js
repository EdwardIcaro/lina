"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const veiculoController_1 = require("../controllers/veiculoController");
const router = (0, express_1.Router)();
// Rotas de veículos (todas requerem middleware de multi-empresa)
router.post('/', veiculoController_1.createVeiculo);
router.get('/', veiculoController_1.getVeiculos);
router.get('/placa/:placa', veiculoController_1.getVeiculoByPlaca);
router.get('/:id', veiculoController_1.getVeiculoById);
router.put('/:id', veiculoController_1.updateVeiculo);
router.delete('/:id', veiculoController_1.deleteVeiculo);
exports.default = router;
//# sourceMappingURL=veiculo.js.map