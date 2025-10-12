"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdicional = exports.deleteServico = exports.updateAdicional = exports.updateServico = exports.getAdicionalById = exports.getServicoById = exports.getAdicionais = exports.getAdicionaisSimple = exports.getServicosSimple = exports.getServicos = exports.createAdicional = exports.createServico = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Criar novo serviço
 */
const createServico = async (req, res) => {
    try {
        const { nome, descricao, duracao, precos } = req.body; // 'precos' é um array: [{ categoriaId: string, preco: number }]
        if (!nome || !precos || !Array.isArray(precos) || precos.length === 0) {
            return res.status(400).json({
                error: 'Nome e pelo menos um preço por categoria são obrigatórios'
            });
        }
        const servico = await prisma.$transaction(async (tx) => {
            // 1. Criar o serviço
            const novoServico = await tx.servico.create({
                data: {
                    nome,
                    descricao,
                    duracao,
                    empresaId: req.empresaId
                }
            });
            // 2. Criar os preços associados
            await tx.precoServico.createMany({
                data: precos.map(p => ({
                    servicoId: novoServico.id,
                    categoriaId: p.categoriaId,
                    preco: p.preco,
                    empresaId: req.empresaId
                }))
            });
            return novoServico;
        });
        // Buscar o serviço completo com os preços para retornar ao frontend
        const servicoCompleto = await prisma.servico.findUnique({
            where: { id: servico.id },
            include: {
                precos: {
                    include: {
                        categoria: true
                    }
                },
                _count: {
                    select: { ordemItems: true }
                }
            },
        });
        res.status(201).json({
            message: 'Serviço criado com sucesso',
            servico: servicoCompleto
        });
    }
    catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createServico = createServico;
/**
 * Criar novo serviço adicional
 */
const createAdicional = async (req, res) => {
    try {
        const { nome, descricao, precos } = req.body; // 'precos' é um array: [{ categoriaId: string, preco: number }]
        if (!nome || !precos || !Array.isArray(precos) || precos.length === 0) {
            return res.status(400).json({
                error: 'Nome e pelo menos um preço por categoria são obrigatórios'
            });
        }
        const adicional = await prisma.$transaction(async (tx) => {
            // 1. Criar o serviço adicional
            const novoAdicional = await tx.adicional.create({
                data: {
                    nome,
                    descricao,
                    empresaId: req.empresaId
                }
            });
            // 2. Criar os preços associados
            await tx.precoAdicional.createMany({
                data: precos.map(p => ({
                    adicionalId: novoAdicional.id,
                    categoriaId: p.categoriaId,
                    preco: p.preco,
                    empresaId: req.empresaId
                }))
            });
            return novoAdicional;
        });
        // Buscar o adicional completo com os preços para retornar ao frontend
        const adicionalCompleto = await prisma.adicional.findUnique({
            where: { id: adicional.id },
            include: {
                precos: {
                    include: {
                        categoria: true
                    }
                },
                _count: {
                    select: { ordemItems: true }
                }
            },
        });
        res.status(201).json({
            message: 'Serviço adicional criado com sucesso',
            adicional: adicionalCompleto
        });
    }
    catch (error) {
        console.error('Erro ao criar serviço adicional:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createAdicional = createAdicional;
/**
 * Listar serviços da empresa (com paginação)
 */
const getServicos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, ativo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            empresaId: req.empresaId
        };
        if (search) {
            where.nome = { contains: search };
        }
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        const [servicos, total] = await Promise.all([
            prisma.servico.findMany({
                where,
                include: {
                    precos: {
                        include: {
                            categoria: true
                        }
                    },
                    _count: {
                        select: {
                            ordemItems: true
                        }
                    }
                },
                orderBy: {
                    nome: 'asc'
                },
                skip,
                take: Number(limit)
            }),
            prisma.servico.count({ where })
        ]);
        res.json({
            servicos,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getServicos = getServicos;
/**
 * Listar serviços da empresa (formato simples para frontend)
 */
const getServicosSimple = async (req, res) => {
    try {
        const { ativo } = req.query;
        const where = {
            empresaId: req.empresaId
        };
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        const servicos = await prisma.servico.findMany({
            where,
            orderBy: {
                nome: 'asc'
            }
        });
        res.json({ servicos }); // Envolve a resposta em um objeto { servicos: [...] }
    }
    catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getServicosSimple = getServicosSimple;
/**
 * Listar serviços adicionais da empresa (formato simples para frontend)
 */
const getAdicionaisSimple = async (req, res) => {
    try {
        const { ativo } = req.query;
        const where = {
            empresaId: req.empresaId
        };
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        const adicionais = await prisma.adicional.findMany({
            where,
            orderBy: {
                nome: 'asc'
            },
            include: {
                precos: true // Incluir os preços para uso no frontend
            }
        });
        res.json({ adicionais });
    }
    catch (error) {
        console.error('Erro ao listar serviços adicionais (simples):', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAdicionaisSimple = getAdicionaisSimple;
/**
 * Listar serviços adicionais da empresa
 */
const getAdicionais = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, ativo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            empresaId: req.empresaId
        };
        if (search) {
            where.nome = { contains: search };
        }
        if (ativo !== undefined) {
            where.ativo = ativo === 'true';
        }
        const [adicionais, total] = await Promise.all([
            prisma.adicional.findMany({
                where,
                include: {
                    precos: {
                        include: {
                            categoria: true
                        }
                    },
                    _count: {
                        select: {
                            ordemItems: true
                        }
                    }
                },
                orderBy: {
                    nome: 'asc'
                },
                skip,
                take: Number(limit)
            }),
            prisma.adicional.count({ where })
        ]);
        res.json({
            adicionais,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar serviços adicionais:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAdicionais = getAdicionais;
/**
 * Buscar serviço por ID
 */
const getServicoById = async (req, res) => {
    try {
        const { id } = req.params;
        const servico = await prisma.servico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                ordemItems: {
                    include: {
                        ordem: {
                            select: {
                                id: true,
                                status: true,
                                createdAt: true,
                                cliente: {
                                    select: {
                                        nome: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                _count: {
                    select: {
                        ordemItems: true
                    }
                }
            }
        });
        if (!servico) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        res.json(servico);
    }
    catch (error) {
        console.error('Erro ao buscar serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getServicoById = getServicoById;
/**
 * Buscar serviço adicional por ID
 */
const getAdicionalById = async (req, res) => {
    try {
        const { id } = req.params;
        const adicional = await prisma.adicional.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                precos: {
                    include: {
                        categoria: true
                    }
                },
                ordemItems: {
                    include: {
                        ordem: {
                            select: {
                                id: true,
                                status: true,
                                createdAt: true,
                                cliente: {
                                    select: {
                                        nome: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                _count: {
                    select: {
                        ordemItems: true
                    }
                }
            }
        });
        if (!adicional) {
            return res.status(404).json({ error: 'Serviço adicional não encontrado' });
        }
        res.json(adicional);
    }
    catch (error) {
        console.error('Erro ao buscar serviço adicional:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAdicionalById = getAdicionalById;
/**
 * Atualizar serviço
 */
const updateServico = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, duracao, ativo, precos } = req.body; // precos: [{ categoriaId: string, preco: number }]
        // Verificar se serviço existe e pertence à empresa
        const existingServico = await prisma.servico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!existingServico) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        await prisma.$transaction(async (tx) => {
            // 1. Atualizar dados básicos do serviço
            await tx.servico.update({
                where: { id },
                data: {
                    ...(nome && { nome }),
                    ...(descricao !== undefined && { descricao }),
                    ...(duracao !== undefined && { duracao }),
                    ...(ativo !== undefined && { ativo })
                }
            });
            // 2. Atualizar preços (deletar antigos e criar novos)
            if (precos && Array.isArray(precos) && precos.length > 0) {
                await tx.precoServico.deleteMany({ where: { servicoId: id } });
                await tx.precoServico.createMany({
                    data: precos.map(p => ({
                        servicoId: id,
                        categoriaId: p.categoriaId,
                        preco: p.preco,
                        empresaId: req.empresaId
                    }))
                });
            }
        });
        const servico = await prisma.servico.findUnique({
            where: { id: id },
            include: {
                precos: { include: { categoria: true } },
                _count: { select: { ordemItems: true } }
            },
        });
        res.json({
            message: 'Serviço atualizado com sucesso',
            servico
        });
    }
    catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateServico = updateServico;
/**
 * Atualizar serviço adicional
 */
const updateAdicional = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, ativo, precos } = req.body; // precos: [{ categoriaId: string, preco: number }]
        // Verificar se serviço adicional existe e pertence à empresa
        const existingAdicional = await prisma.adicional.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!existingAdicional) {
            return res.status(404).json({ error: 'Serviço adicional não encontrado' });
        }
        await prisma.$transaction(async (tx) => {
            // 1. Atualizar dados básicos do adicional
            await tx.adicional.update({
                where: { id },
                data: {
                    ...(nome && { nome }),
                    ...(descricao !== undefined && { descricao }),
                    ...(ativo !== undefined && { ativo })
                }
            });
            // 2. Atualizar preços (deletar antigos e criar novos)
            if (precos && Array.isArray(precos) && precos.length > 0) {
                await tx.precoAdicional.deleteMany({ where: { adicionalId: id } });
                await tx.precoAdicional.createMany({
                    data: precos.map(p => ({
                        adicionalId: id,
                        categoriaId: p.categoriaId,
                        preco: p.preco,
                        empresaId: req.empresaId
                    }))
                });
            }
        });
        const adicionalAtualizado = await prisma.adicional.findUnique({
            where: { id: id },
            include: {
                precos: { include: { categoria: true } },
                _count: { select: { ordemItems: true } }
            },
        });
        res.json({
            message: 'Serviço adicional atualizado com sucesso',
            adicional: adicionalAtualizado
        });
    }
    catch (error) {
        console.error('Erro ao atualizar serviço adicional:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateAdicional = updateAdicional;
/**
 * Excluir serviço
 */
const deleteServico = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se serviço existe e pertence à empresa
        const servico = await prisma.servico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                _count: {
                    select: {
                        ordemItems: true
                    }
                }
            }
        });
        if (!servico) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        // Não permitir excluir serviço com itens de ordem
        if (servico._count.ordemItems > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir serviço que já foi utilizado em ordens de serviço'
            });
        }
        await prisma.servico.delete({
            where: { id }
        });
        res.json({
            message: 'Serviço excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteServico = deleteServico;
/**
 * Excluir serviço adicional
 */
const deleteAdicional = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se serviço adicional existe e pertence à empresa
        const adicional = await prisma.adicional.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                _count: {
                    select: {
                        ordemItems: true
                    }
                }
            }
        });
        if (!adicional) {
            return res.status(404).json({ error: 'Serviço adicional não encontrado' });
        }
        // Não permitir excluir serviço adicional com itens de ordem
        if (adicional._count.ordemItems > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir serviço adicional que já foi utilizado em ordens de serviço'
            });
        }
        await prisma.adicional.delete({
            where: { id }
        });
        res.json({
            message: 'Serviço adicional excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir serviço adicional:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteAdicional = deleteAdicional;
//# sourceMappingURL=servicoController.js.map