"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresaController_1 = require("../controllers/empresaController");
const router = (0, express_1.Router)();
// Todas as rotas de empresa agora são protegidas pelo authMiddleware em index.ts
router.post('/', empresaController_1.createEmpresa);
router.get('/', empresaController_1.getEmpresas);
router.get('/:id', empresaController_1.getEmpresaById);
router.put('/:id', empresaController_1.updateEmpresa);
router.patch('/:id/status', empresaController_1.toggleEmpresaStatus);
exports.default = router;
//# sourceMappingURL=empresa.js.map