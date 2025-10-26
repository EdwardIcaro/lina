"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fornecedorController_1 = require("../controllers/fornecedorController");
const router = (0, express_1.Router)();
router.get('/', fornecedorController_1.getFornecedores);
exports.default = router;
//# sourceMappingURL=fornecedor.js.map