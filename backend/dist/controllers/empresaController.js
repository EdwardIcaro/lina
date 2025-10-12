"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateEmpresa = exports.toggleEmpresaStatus = exports.updateEmpresa = exports.getEmpresaById = exports.getEmpresas = exports.createEmpresa = void 0;
const prisma_1 = require("../generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new prisma_1.PrismaClient();
/**
 * Criar nova empresa
 */
const createEmpresa = async (req, res) => {
    try {
        const { nome, cnpj, senhaChave } = req.body;
        // Validações básicas
        if (!nome || !senhaChave) {
            return res.status(400).json({
                error: 'Nome e senha chave são obrigatórios'
            });
        }
        // Verificar se empresa já existe
        const existingEmpresa = await prisma.empresa.findFirst({
            where: {
                OR: [
                    { nome: { equals: nome } },
                    ...(cnpj ? [{ cnpj }] : [])
                ]
            }
        });
        if (existingEmpresa) {
            return res.status(400).json({
                error: 'Empresa com este nome ou CNPJ já existe'
            });
        }
        // Hash da senha chave
        const hashedSenhaChave = await bcrypt_1.default.hash(senhaChave, 12);
        // Criar empresa
        const empresa = await prisma.empresa.create({
            data: {
                nome,
                cnpj,
                senhaChave: hashedSenhaChave,
                config: {
                    moeda: 'BRL',
                    timezone: 'America/Sao_Paulo'
                }
            },
            select: {
                id: true,
                nome: true,
                cnpj: true,
                ativo: true,
                config: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json({
            message: 'Empresa criada com sucesso',
            empresa
        });
    }
    catch (error) {
        console.error('Erro ao criar empresa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createEmpresa = createEmpresa;
/**
 * Listar todas as empresas (apenas para admin)
 */
const getEmpresas = async (req, res) => {
    try {
        const empresas = await prisma.empresa.findMany({
            select: {
                id: true,
                nome: true,
                cnpj: true,
                ativo: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        clientes: true,
                        lavadores: true,
                        ordens: true
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(empresas);
    }
    catch (error) {
        console.error('Erro ao listar empresas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getEmpresas = getEmpresas;
/**
 * Buscar empresa por ID
 */
const getEmpresaById = async (req, res) => {
    try {
        const { id } = req.params;
        const empresa = await prisma.empresa.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                cnpj: true,
                ativo: true,
                config: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        clientes: true,
                        lavadores: true,
                        servicos: true,
                        ordens: true
                    }
                }
            }
        });
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        res.json(empresa);
    }
    catch (error) {
        console.error('Erro ao buscar empresa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getEmpresaById = getEmpresaById;
/**
 * Atualizar empresa
 */
const updateEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cnpj, senhaChave, config } = req.body;
        // Verificar se empresa existe
        const existingEmpresa = await prisma.empresa.findUnique({
            where: { id }
        });
        if (!existingEmpresa) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        // Preparar dados para atualização
        const updateData = {};
        if (nome)
            updateData.nome = nome;
        if (cnpj !== undefined)
            updateData.cnpj = cnpj;
        if (config)
            updateData.config = config;
        // Se senha chave for fornecida, fazer hash
        if (senhaChave) {
            updateData.senhaChave = await bcrypt_1.default.hash(senhaChave, 12);
        }
        const empresa = await prisma.empresa.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                nome: true,
                cnpj: true,
                ativo: true,
                config: true,
                updatedAt: true
            }
        });
        res.json({
            message: 'Empresa atualizada com sucesso',
            empresa
        });
    }
    catch (error) {
        console.error('Erro ao atualizar empresa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateEmpresa = updateEmpresa;
/**
 * Desativar/ativar empresa
 */
const toggleEmpresaStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const empresa = await prisma.empresa.update({
            where: { id },
            data: {
                ativo: {
                    set: !(await prisma.empresa.findUnique({ where: { id } }))?.ativo
                }
            },
            select: {
                id: true,
                nome: true,
                ativo: true,
                updatedAt: true
            }
        });
        res.json({
            message: `Empresa ${empresa.ativo ? 'ativada' : 'desativada'} com sucesso`,
            empresa
        });
    }
    catch (error) {
        console.error('Erro ao alterar status da empresa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.toggleEmpresaStatus = toggleEmpresaStatus;
/**
 * Autenticar empresa (login)
 */
const authenticateEmpresa = async (req, res) => {
    try {
        const { nome, senhaChave } = req.body;
        if (!nome || !senhaChave) {
            return res.status(400).json({
                error: 'Nome e senha chave são obrigatórios'
            });
        }
        // Buscar empresa pelo nome
        const empresa = await prisma.empresa.findFirst({
            where: {
                nome: { equals: nome },
                ativo: true
            }
        });
        if (!empresa) {
            return res.status(404).json({
                error: 'Empresa não encontrada ou inativa'
            });
        }
        // Verificar senha chave
        const isSenhaValida = await bcrypt_1.default.compare(senhaChave, empresa.senhaChave);
        if (!isSenhaValida) {
            return res.status(401).json({
                error: 'Senha chave inválida'
            });
        }
        // Retornar dados da empresa (sem a senha)
        const { senhaChave: _, ...empresaData } = empresa;
        res.json({
            message: 'Autenticação realizada com sucesso',
            empresa: empresaData
        });
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.authenticateEmpresa = authenticateEmpresa;
//# sourceMappingURL=empresaController.js.map