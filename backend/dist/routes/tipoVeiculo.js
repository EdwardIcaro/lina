"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tipoVeiculoController_1 = require("../controllers/tipoVeiculoController");
const router = (0, express_1.Router)();
// Rotas de tipos de veículo (ex: /api/tipos-veiculo)
router.post('/', tipoVeiculoController_1.createTipoVeiculo);
router.get('/', tipoVeiculoController_1.getTiposVeiculo);
router.get('/:id', tipoVeiculoController_1.getTipoVeiculoById);
router.put('/:id', tipoVeiculoController_1.updateTipoVeiculo);
router.delete('/:id', tipoVeiculoController_1.deleteTipoVeiculo);
// Rota para obter subtipos por categoria (ex: /api/tipos-veiculo/subtipos/Carro)
router.get('/subtipos/:categoria', tipoVeiculoController_1.getSubtiposByTipo);
exports.default = router;
//# sourceMappingURL=tipoVeiculo.js.map