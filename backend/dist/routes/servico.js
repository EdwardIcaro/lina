"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const servicoController_1 = require("../controllers/servicoController");
const router = (0, express_1.Router)();
// Rotas de serviços adicionais (ex: /api/servicos/adicionais)
router.post('/adicionais', servicoController_1.createAdicional);
router.get('/adicionais/simple', servicoController_1.getAdicionaisSimple);
router.get('/adicionais', servicoController_1.getAdicionais);
router.get('/adicionais/:id', servicoController_1.getAdicionalById);
router.put('/adicionais/:id', servicoController_1.updateAdicional);
router.delete('/adicionais/:id', servicoController_1.deleteAdicional);
// Rotas de serviços principais (ex: /api/servicos)
router.post('/', servicoController_1.createServico);
router.get('/', servicoController_1.getServicos);
router.get('/simple', servicoController_1.getServicosSimple); // Rota simples para frontend
router.get('/:id', servicoController_1.getServicoById);
router.put('/:id', servicoController_1.updateServico);
router.delete('/:id', servicoController_1.deleteServico);
exports.default = router;
//# sourceMappingURL=servico.js.map