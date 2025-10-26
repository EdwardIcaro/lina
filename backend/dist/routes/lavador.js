"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lavadorController_1 = require("../controllers/lavadorController");
const router = (0, express_1.Router)();
router.get('/', lavadorController_1.getLavadores);
router.get('/simple', lavadorController_1.getLavadoresSimple); // <-- Rota que estava faltando
router.post('/', lavadorController_1.createLavador);
router.put('/:id', lavadorController_1.updateLavador);
router.delete('/:id', lavadorController_1.deleteLavador);
router.get('/:id/token', lavadorController_1.gerarTokenPublico); // <-- Rota que estava faltando
exports.default = router;
//# sourceMappingURL=lavador.js.map