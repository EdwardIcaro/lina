"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriaController_1 = require("../controllers/categoriaController");
const router = (0, express_1.Router)();
// Rota para buscar todas as categorias da empresa
router.get('/', categoriaController_1.getCategorias);
exports.default = router;
//# sourceMappingURL=categoria.js.map