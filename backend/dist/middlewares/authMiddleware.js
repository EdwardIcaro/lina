"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // O ID da empresa selecionada é enviado no header 'x-empresa-id'
    const empresaId = req.headers['x-empresa-id'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido ou malformado' });
    }
    if (!empresaId) {
        return res.status(401).json({ error: 'ID da empresa não fornecido no cabeçalho' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_aqui');
        // Anexa os IDs à requisição para que possam ser usados nos controllers
        req.usuarioId = decoded.id;
        req.empresaId = empresaId;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map