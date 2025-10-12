"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClienteByPlaca = exports.deleteCliente = exports.updateCliente = exports.getClienteById = exports.getClientes = exports.createCliente = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Criar novo cliente
 */
const createCliente = async (req, res) => {
    try {
        const { nome, telefone, email } = req.body;
        if (!nome) {
            return res.status(400).json({
                error: 'Nome do cliente é obrigatório'
            });
        }
        // Verificar se cliente já existe na mesma empresa
        const existingCliente = await prisma.cliente.findFirst({
            where: {
                empresaId: req.empresaId,
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(telefone ? [{ telefone }] : [])
                ]
            }
        });
        if (existingCliente) {
            return res.status(400).json({
                error: 'Cliente com este email ou telefone já existe'
            });
        }
        const cliente = await prisma.cliente.create({
            data: {
                empresaId: req.empresaId,
                nome,
                telefone,
                email
            },
            include: {
                veiculos: true,
                _count: {
                    select: {
                        ordens: true,
                        veiculos: true
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Cliente criado com sucesso',
            cliente
        });
    }
    catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createCliente = createCliente;
/**
 * Listar clientes da empresa
 */
const getClientes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Construir filtro de busca
        const where = {
            empresaId: req.empresaId
        };
        if (search) {
            where.OR = [
                { nome: { contains: search } },
                { telefone: { contains: search } },
                { email: { contains: search } }
            ];
        }
        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                include: {
                    veiculos: {
                        select: {
                            id: true,
                            placa: true,
                            modelo: true,
                            cor: true
                        }
                    },
                    ordens: {
                        include: {
                            lavador: {
                                select: {
                                    id: true,
                                    nome: true
                                }
                            },
                            items: {
                                include: {
                                    servico: {
                                        select: {
                                            id: true,
                                            nome: true,
                                        }
                                    },
                                    adicional: {
                                        select: {
                                            id: true,
                                            nome: true,
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    _count: {
                        select: {
                            ordens: true,
                            veiculos: true
                        }
                    }
                },
                orderBy: {
                    nome: 'asc'
                },
                skip,
                take: Number(limit)
            }),
            prisma.cliente.count({ where })
        ]);
        res.json({
            clientes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getClientes = getClientes;
/**
 * Buscar cliente por ID
 */
const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await prisma.cliente.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                veiculos: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                ordens: {
                    include: {
                        veiculo: {
                            select: {
                                placa: true,
                                modelo: true
                            }
                        },
                        lavador: {
                            select: {
                                nome: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10 // Últimas 10 ordens
                },
                _count: {
                    select: {
                        ordens: true,
                        veiculos: true
                    }
                }
            }
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(cliente);
    }
    catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getClienteById = getClienteById;
/**
 * Atualizar cliente
 */
const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone, email, ativo } = req.body;
        // Verificar se cliente existe e pertence à empresa
        const existingCliente = await prisma.cliente.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!existingCliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        // Verificar duplicidade de email/telefone
        if (email || telefone) {
            const duplicateCliente = await prisma.cliente.findFirst({
                where: {
                    AND: [
                        { empresaId: req.empresaId },
                        { id: { not: id } },
                        {
                            OR: [
                                ...(email ? [{ email }] : []),
                                ...(telefone ? [{ telefone }] : [])
                            ]
                        }
                    ]
                }
            });
            if (duplicateCliente) {
                return res.status(400).json({
                    error: 'Já existe um cliente com este email ou telefone'
                });
            }
        }
        const cliente = await prisma.cliente.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(telefone !== undefined && { telefone }),
                ...(email !== undefined && { email }),
                ...(ativo !== undefined && { ativo })
            },
            include: {
                veiculos: true,
                _count: {
                    select: {
                        ordens: true,
                        veiculos: true
                    }
                }
            }
        });
        res.json({
            message: 'Cliente atualizado com sucesso',
            cliente
        });
    }
    catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateCliente = updateCliente;
/**
 * Excluir cliente
 */
const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se cliente existe e pertence à empresa
        const cliente = await prisma.cliente.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                _count: {
                    select: {
                        ordens: true,
                        veiculos: true
                    }
                }
            }
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        // Não permitir excluir cliente com ordens ou veículos
        if (cliente._count.ordens > 0 || cliente._count.veiculos > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir cliente com ordens de serviço ou veículos cadastrados'
            });
        }
        await prisma.cliente.delete({
            where: { id }
        });
        res.json({
            message: 'Cliente excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteCliente = deleteCliente;
/**
 * Buscar cliente por placa do veículo
 */
const getClienteByPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        const veiculo = await prisma.veiculo.findFirst({
            where: {
                placa: { equals: placa },
                cliente: {
                    empresaId: req.empresaId
                }
            },
            include: {
                cliente: {
                    include: {
                        veiculos: true,
                        _count: {
                            select: {
                                ordens: true
                            }
                        }
                    }
                }
            }
        });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        res.json({
            cliente: veiculo.cliente,
            veiculo
        });
    }
    catch (error) {
        console.error('Erro ao buscar cliente por placa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getClienteByPlaca = getClienteByPlaca;
//# sourceMappingURL=clienteController.js.map