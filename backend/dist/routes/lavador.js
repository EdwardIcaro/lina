"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lavadorController_1 = require("../controllers/lavadorController");
const router = (0, express_1.Router)();
// Rotas de lavadores (todas requerem middleware de multi-empresa)
router.post('/', lavadorController_1.createLavador);
router.get('/', lavadorController_1.getLavadores);
router.get('/simple', lavadorController_1.getLavadoresSimple); // Rota simples para frontend
router.get('/:id', lavadorController_1.getLavadorById);
router.put('/:id', lavadorController_1.updateLavador);
router.delete('/:id', lavadorController_1.deleteLavador);
router.patch('/:id/toggle', lavadorController_1.toggleLavadorStatus);
exports.default = router;
//# sourceMappingURL=lavador.js.map