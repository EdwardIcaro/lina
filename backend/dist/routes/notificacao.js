"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const notificacaoController_1 = require("../controllers/notificacaoController");
const router = (0, express_1.Router)();
// Todas as rotas de notificação exigem autenticação de empresa
router.get('/', authMiddleware_1.default, notificacaoController_1.getNotificacoes);
router.patch('/:id/lida', authMiddleware_1.default, notificacaoController_1.marcarComoLida);
router.post('/marcar-todas-lidas', authMiddleware_1.default, notificacaoController_1.marcarTodasComoLidas);
exports.default = router;
//# sourceMappingURL=notificacao.js.map