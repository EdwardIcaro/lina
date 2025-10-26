"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFornecedores = void 0;
const db_1 = __importDefault(require("../db"));
/**
 * Listar todos os fornecedores da empresa
 */
const getFornecedores = async (req, res) => {
    try {
        const fornecedores = await db_1.default.fornecedor.findMany({
            where: { empresaId: req.empresaId },
            orderBy: { nome: 'asc' },
        });
        res.json(fornecedores);
    }
    catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ error: 'Erro ao buscar fornecedores.' });
    }
};
exports.getFornecedores = getFornecedores;
//# sourceMappingURL=fornecedorController.js.map