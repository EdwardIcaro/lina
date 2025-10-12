"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmpresaPermission = exports.createEmpresaFilter = exports.validateSenhaChave = exports.authMiddleware = exports.multiEmpresaMiddleware = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Middleware de multi-empresa para isolamento de dados
 * Extrai o empresaId do header e valida se a empresa existe
 */
const multiEmpresaMiddleware = async (req, res, next) => {
    try {
        // Extrair empresaId do header
        const empresaId = req.headers['x-empresa-id'];
        if (!empresaId) {
            return res.status(400).json({
                error: 'Empresa ID é obrigatório no header x-empresa-id'
            });
        }
        // Validar se a empresa existe e está ativa
        const empresa = await prisma.empresa.findFirst({
            where: {
                id: empresaId,
                ativo: true
            }
        });
        if (!empresa) {
            return res.status(404).json({
                error: 'Empresa não encontrada ou inativa'
            });
        }
        // Adicionar empresaId e empresa ao request para uso nos controllers
        req.empresaId = empresaId;
        req.empresa = empresa;
        next();
    }
    catch (error) {
        console.error('Erro no middleware de multi-empresa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.multiEmpresaMiddleware = multiEmpresaMiddleware;
/**
 * Middleware de autenticação simples.
 * Em um app real, aqui você validaria um token JWT.
 * Por agora, apenas garantimos que o multiEmpresaMiddleware foi executado.
 */
const authMiddleware = (req, res, next) => {
    // O multiEmpresaMiddleware já validou a empresa e adicionou o empresaId.
    // Se chegamos aqui, consideramos o usuário "autenticado" para o contexto da empresa.
    next();
};
exports.authMiddleware = authMiddleware;
/**
 * Middleware para validar senha chave da empresa
 * Usado no login e em operações sensíveis
 */
const validateSenhaChave = async (req, res, next) => {
    try {
        const { senhaChave } = req.body;
        if (!senhaChave) {
            return res.status(400).json({
                error: 'Senha chave é obrigatória'
            });
        }
        if (!req.empresa) {
            return res.status(400).json({
                error: 'Empresa não encontrada no contexto'
            });
        }
        // Comparar senha chave (em produção, usar bcrypt)
        if (senhaChave !== req.empresa.senhaChave) {
            return res.status(401).json({
                error: 'Senha chave inválida'
            });
        }
        next();
    }
    catch (error) {
        console.error('Erro na validação de senha chave:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.validateSenhaChave = validateSenhaChave;
/**
 * Helper para criar filtro de empresa para queries Prisma
 */
const createEmpresaFilter = (empresaId) => {
    return {
        empresaId: empresaId
    };
};
exports.createEmpresaFilter = createEmpresaFilter;
/**
 * Helper para verificar permissão de acesso a dados
 */
const checkEmpresaPermission = (data, empresaId) => {
    return data && data.empresaId === empresaId;
};
exports.checkEmpresaPermission = checkEmpresaPermission;
//# sourceMappingURL=multiEmpresa.js.map