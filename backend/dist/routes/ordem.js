"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ordemController_1 = require("../controllers/ordemController");
const router = (0, express_1.Router)();
// Rotas de ordens de serviço (todas requerem middleware de multi-empresa)
router.post('/', ordemController_1.createOrdem);
router.get('/', ordemController_1.getOrdens);
router.get('/stats', ordemController_1.getOrdensStats);
router.get('/:id', ordemController_1.getOrdemById);
router.put('/:id', ordemController_1.updateOrdem);
router.patch('/:id/cancel', ordemController_1.cancelOrdem);
router.delete('/:id', ordemController_1.deleteOrdem);
exports.default = router;
//# sourceMappingURL=ordem.js.map