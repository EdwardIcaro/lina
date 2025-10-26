"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioController_1 = require("../controllers/usuarioController");
const userAuthMiddleware_1 = __importDefault(require("../middlewares/userAuthMiddleware"));
const router = (0, express_1.Router)();
// Rota para criar um novo usuário
router.post('/', usuarioController_1.createUsuario);
// Rota para autenticar (login) um usuário
router.post('/auth', usuarioController_1.authenticateUsuario);
// Rota para gerar um novo token com o escopo de uma empresa
router.post('/scope-token', userAuthMiddleware_1.default, usuarioController_1.generateScopedToken);
exports.default = router;
//# sourceMappingURL=usuario.js.map