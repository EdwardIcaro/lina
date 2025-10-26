"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adicionalController_1 = require("../controllers/adicionalController");
const router = (0, express_1.Router)();
router.get('/', adicionalController_1.getAdicionais);
router.get('/simple', adicionalController_1.getAdicionaisSimple);
router.post('/', adicionalController_1.createAdicional);
router.put('/:id', adicionalController_1.updateAdicional);
router.delete('/:id', adicionalController_1.deleteAdicional);
exports.default = router;
//# sourceMappingURL=adicional.js.map