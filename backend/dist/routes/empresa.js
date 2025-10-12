"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empresaController_1 = require("../controllers/empresaController");
const router = (0, express_1.Router)();
// Rotas públicas (sem middleware de multi-empresa)
router.post('/auth', empresaController_1.authenticateEmpresa);
router.post('/', empresaController_1.createEmpresa);
// Rotas que precisam de autenticação de empresa
router.get('/', empresaController_1.getEmpresas);
router.get('/:id', empresaController_1.getEmpresaById);
router.put('/:id', empresaController_1.updateEmpresa);
router.patch('/:id/toggle', empresaController_1.toggleEmpresaStatus);
exports.default = router;
//# sourceMappingURL=empresa.js.map