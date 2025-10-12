"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrdem = exports.getOrdensStats = exports.cancelOrdem = exports.updateOrdem = exports.getOrdemById = exports.getOrdens = exports.createOrdem = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Criar nova ordem de serviço
 */
const createOrdem = async (req, res) => {
    return await prisma.$transaction(async (tx) => {
        const { clienteId, veiculoId, lavadorId, itens, observacoes } = req.body;
        if (!clienteId || !veiculoId || !itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                error: 'Cliente ID, veículo ID e itens são obrigatórios'
            });
        }
        // Verificar se cliente existe e pertence à empresa
        const cliente = await tx.cliente.findFirst({
            where: {
                id: clienteId,
                empresaId: req.empresaId
            }
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        // Verificar se veículo existe e pertence ao cliente
        const veiculo = await tx.veiculo.findFirst({
            where: {
                id: veiculoId,
                clienteId
            }
        });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence ao cliente' });
        }
        if (!veiculo.categoriaId) {
            return res.status(400).json({ error: 'O veículo precisa ter uma categoria definida para criar uma ordem.' });
        }
        // Verificar se lavador existe e pertence à empresa (se fornecido)
        if (lavadorId) {
            const lavador = await tx.lavador.findFirst({
                where: {
                    id: lavadorId,
                    empresaId: req.empresaId,
                    ativo: true
                }
            });
            if (!lavador) {
                return res.status(404).json({ error: 'Lavador não encontrado ou inativo' });
            }
        }
        // Validar itens e calcular valores
        let valorTotal = 0;
        const itensData = [];
        for (const item of itens) {
            const { tipo, itemId, quantidade } = item;
            if (!tipo || !itemId || quantidade <= 0) {
                return res.status(400).json({
                    error: 'Cada item deve ter tipo, ID e quantidade válida'
                });
            }
            let itemData;
            let precoUnitario = 0;
            if (tipo === prisma_1.OrdemItemType.SERVICO) {
                const servicoComPreco = await tx.servico.findUnique({
                    where: {
                        id: itemId,
                        empresaId: req.empresaId,
                        ativo: true
                    },
                    include: {
                        precos: {
                            where: { categoriaId: veiculo.categoriaId }
                        }
                    }
                });
                if (!servicoComPreco) {
                    return res.status(404).json({ error: `Serviço com ID ${itemId} não encontrado` });
                }
                if (!servicoComPreco.precos || servicoComPreco.precos.length === 0) {
                    return res.status(400).json({ error: `Serviço '${servicoComPreco.nome}' não tem preço definido para a categoria deste veículo.` });
                }
                precoUnitario = servicoComPreco.precos[0].preco;
                itemData = {
                    tipo: prisma_1.OrdemItemType.SERVICO,
                    servicoId: itemId,
                    quantidade,
                    precoUnit: precoUnitario,
                    subtotal: precoUnitario * quantidade
                };
            }
            else if (tipo === prisma_1.OrdemItemType.ADICIONAL) {
                const adicionalComPreco = await tx.adicional.findUnique({
                    where: {
                        id: itemId,
                        empresaId: req.empresaId,
                        ativo: true
                    },
                    include: {
                        precos: {
                            where: { categoriaId: veiculo.categoriaId }
                        }
                    }
                });
                if (!adicionalComPreco) {
                    return res.status(404).json({ error: `Serviço adicional com ID ${itemId} não encontrado` });
                }
                if (!adicionalComPreco.precos || adicionalComPreco.precos.length === 0) {
                    return res.status(400).json({ error: `Serviço adicional '${adicionalComPreco.nome}' não tem preço definido para a categoria deste veículo.` });
                }
                precoUnitario = adicionalComPreco.precos[0].preco;
                itemData = {
                    tipo: prisma_1.OrdemItemType.ADICIONAL,
                    adicionalId: itemId,
                    quantidade,
                    precoUnit: precoUnitario,
                    subtotal: precoUnitario * quantidade
                };
            }
            else {
                return res.status(400).json({
                    error: 'Tipo de item inválido. Use SERVICO ou ADICIONAL'
                });
            }
            itensData.push(itemData);
            valorTotal += itemData.subtotal;
        }
        // Criar ordem de serviço com itens
        const ordem = await tx.ordemServico.create({
            data: {
                empresaId: req.empresaId,
                clienteId,
                veiculoId,
                lavadorId,
                status: lavadorId ? prisma_1.OrdemStatus.EM_ANDAMENTO : prisma_1.OrdemStatus.PENDENTE,
                valorTotal,
                observacoes,
                items: {
                    create: itensData
                }
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                },
                veiculo: {
                    select: {
                        id: true,
                        placa: true,
                        modelo: true,
                        cor: true
                    }
                },
                lavador: {
                    select: {
                        id: true,
                        nome: true,
                        comissao: true
                    }
                },
                items: {
                    include: {
                        servico: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        adicional: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Ordem de serviço criada com sucesso',
            ordem
        });
    }).catch(error => {
        console.error('Erro ao criar ordem de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    });
};
exports.createOrdem = createOrdem;
/**
 * Listar ordens de serviço da empresa
 */
const getOrdens = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, clienteId, lavadorId, dataInicio, dataFim } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            empresaId: req.empresaId
        };
        if (search) {
            where.OR = [
                {
                    cliente: {
                        nome: { contains: search }
                    }
                },
                {
                    veiculo: {
                        placa: { contains: search }
                    }
                }
            ];
        }
        if (status) {
            where.status = status;
        }
        if (clienteId) {
            where.clienteId = clienteId;
        }
        if (lavadorId) {
            where.lavadorId = lavadorId;
        }
        if (dataInicio || dataFim) {
            where.createdAt = {};
            if (dataInicio) {
                where.createdAt.gte = new Date(dataInicio);
            }
            if (dataFim) {
                where.createdAt.lte = new Date(dataFim);
            }
        }
        const [ordens, total] = await Promise.all([
            prisma.ordemServico.findMany({
                where,
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            telefone: true
                        }
                    },
                    veiculo: {
                        select: {
                            id: true,
                            placa: true,
                            modelo: true,
                            cor: true
                        }
                    },
                    lavador: {
                        select: {
                            id: true,
                            nome: true,
                            comissao: true
                        }
                    },
                    items: {
                        include: {
                            servico: {
                                select: {
                                    id: true,
                                    nome: true
                                }
                            },
                            adicional: {
                                select: {
                                    id: true,
                                    nome: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: Number(limit)
            }),
            prisma.ordemServico.count({ where })
        ]);
        res.json({
            ordens,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar ordens de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getOrdens = getOrdens;
/**
 * Buscar ordem de serviço por ID
 */
const getOrdemById = async (req, res) => {
    try {
        const { id } = req.params;
        const ordem = await prisma.ordemServico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true,
                        email: true
                    }
                },
                veiculo: {
                    select: {
                        id: true,
                        placa: true,
                        modelo: true,
                        cor: true,
                        ano: true
                    }
                },
                lavador: {
                    select: {
                        id: true,
                        nome: true,
                        comissao: true
                    }
                },
                items: {
                    include: {
                        servico: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        adicional: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        res.json(ordem);
    }
    catch (error) {
        console.error('Erro ao buscar ordem de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getOrdemById = getOrdemById;
/**
 * Atualizar ordem de serviço
 */
const updateOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, lavadorId, observacoes } = req.body;
        // Verificar se ordem existe e pertence à empresa
        const existingOrdem = await prisma.ordemServico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!existingOrdem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        // Validar status se fornecido
        const statusValidos = ['PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'];
        if (status && !statusValidos.includes(status)) {
            return res.status(400).json({
                error: `Status inválido. Use: ${statusValidos.join(', ')}`
            });
        }
        // Verificar se lavador existe e pertence à empresa (se fornecido)
        if (lavadorId) {
            const lavador = await prisma.lavador.findFirst({
                where: {
                    id: lavadorId,
                    empresaId: req.empresaId,
                    ativo: true
                }
            });
            if (!lavador) {
                return res.status(404).json({ error: 'Lavador não encontrado ou inativo' });
            }
        }
        // Determinar o status com base no lavadorId se não for explicitamente fornecido
        let finalStatus = status;
        if (!status && lavadorId !== undefined) {
            finalStatus = lavadorId ? 'EM_ANDAMENTO' : 'PENDENTE';
        }
        const ordem = await prisma.ordemServico.update({
            where: { id },
            data: {
                ...(finalStatus && { status: finalStatus }),
                ...(lavadorId !== undefined && { lavadorId }),
                ...(observacoes !== undefined && { observacoes }),
                ...(finalStatus === 'FINALIZADO' && { dataFim: new Date() })
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                },
                veiculo: {
                    select: {
                        id: true,
                        placa: true,
                        modelo: true,
                        cor: true
                    }
                },
                lavador: {
                    select: {
                        id: true,
                        nome: true,
                        comissao: true
                    }
                },
                items: {
                    include: {
                        servico: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        adicional: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });
        res.json({
            message: 'Ordem de serviço atualizada com sucesso',
            ordem
        });
    }
    catch (error) {
        console.error('Erro ao atualizar ordem de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateOrdem = updateOrdem;
/**
 * Cancelar ordem de serviço
 */
const cancelOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se ordem existe e pertence à empresa
        const ordem = await prisma.ordemServico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        // Não permitir cancelar ordem já finalizada ou cancelada
        if (ordem.status === 'FINALIZADO' || ordem.status === 'CANCELADO') {
            return res.status(400).json({
                error: 'Não é possível cancelar ordem já finalizada ou cancelada'
            });
        }
        const updatedOrdem = await prisma.ordemServico.update({
            where: { id },
            data: {
                status: 'CANCELADO'
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                },
                veiculo: {
                    select: {
                        id: true,
                        placa: true,
                        modelo: true,
                        cor: true
                    }
                },
                lavador: {
                    select: {
                        id: true,
                        nome: true,
                        comissao: true
                    }
                },
                items: {
                    include: {
                        servico: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        adicional: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });
        res.json({
            message: 'Ordem de serviço cancelada com sucesso',
            ordem: updatedOrdem
        });
    }
    catch (error) {
        console.error('Erro ao cancelar ordem de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.cancelOrdem = cancelOrdem;
/**
 * Obter estatísticas de ordens de serviço
 */
const getOrdensStats = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        const where = {
            empresaId: req.empresaId
        };
        if (dataInicio || dataFim) {
            where.createdAt = {};
            if (dataInicio) {
                where.createdAt.gte = new Date(dataInicio);
            }
            if (dataFim) {
                where.createdAt.lte = new Date(dataFim);
            }
        }
        // Primeiro, obter os IDs das ordens que atendem aos critérios
        const ordensIds = await prisma.ordemServico.findMany({
            where,
            select: { id: true }
        });
        const ordensIdsList = ordensIds.map(o => o.id);
        const [ordensPorStatus, valorTotal, ordensFinalizadas, topServicos, topLavadores] = await Promise.all([
            prisma.ordemServico.groupBy({
                by: ['status'],
                where,
                _count: {
                    status: true
                }
            }),
            prisma.ordemServico.aggregate({
                where,
                _sum: {
                    valorTotal: true
                }
            }),
            prisma.ordemServico.count({
                where: {
                    ...where,
                    status: 'FINALIZADO'
                }
            }),
            // Corrigido: usar ordemId em vez de relação aninhada
            prisma.ordemServicoItem.groupBy({
                by: ['servicoId'],
                where: {
                    ordemId: { in: ordensIdsList },
                    servicoId: { not: null },
                    tipo: 'SERVICO'
                },
                _sum: {
                    quantidade: true
                },
                _count: {
                    id: true
                },
                orderBy: {
                    _sum: {
                        quantidade: 'desc'
                    }
                },
                take: 5
            }),
            prisma.ordemServico.groupBy({
                by: ['lavadorId'],
                where: {
                    ...where,
                    lavadorId: { not: null } // Correção definitiva aqui
                },
                _count: {
                    id: true
                },
                _sum: {
                    valorTotal: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 5
            })
        ]);
        // Buscar detalhes dos serviços e lavadores
        const [servicosDetalhes, lavadoresDetalhes] = await Promise.all([
            prisma.servico.findMany({
                where: {
                    id: { in: topServicos.map(s => s.servicoId).filter(Boolean) }
                },
                select: {
                    id: true,
                    nome: true
                }
            }),
            prisma.lavador.findMany({
                where: {
                    id: { in: topLavadores.map(l => l.lavadorId).filter(Boolean) }
                },
                select: {
                    id: true,
                    nome: true,
                    comissao: true
                }
            })
        ]);
        // Calcular estatísticas adicionais
        const valorTotalFormatado = valorTotal._sum.valorTotal || 0;
        const totalOrdensCount = ordensIdsList.length;
        const taxaConclusao = totalOrdensCount > 0 ? (ordensFinalizadas / totalOrdensCount) * 100 : 0;
        const ticketMedio = ordensFinalizadas > 0 ? valorTotalFormatado / ordensFinalizadas : 0;
        // Estatísticas de pagamentos
        const pagamentosStats = await prisma.pagamento.groupBy({
            by: ['metodo'],
            where: {
                empresaId: req.empresaId,
                status: 'PAGO',
                ordemId: { in: ordensIdsList }
            },
            _sum: {
                valor: true
            },
            _count: {
                _all: true
            }
        });
        const pagamentosPendentes = await prisma.pagamento.aggregate({
            where: {
                empresaId: req.empresaId,
                status: 'PENDENTE',
                ordemId: { in: ordensIdsList }
            },
            _sum: {
                valor: true
            }
        });
        res.json({
            // Estatísticas gerais (compatibilidade com frontend)
            totalOrdens: totalOrdensCount,
            ordensPorStatus,
            valorTotal: valorTotalFormatado,
            ordensFinalizadas,
            taxaConclusao: Math.round(taxaConclusao * 100) / 100,
            ticketMedio: Math.round(ticketMedio * 100) / 100,
            // Top serviços (formato compatível com frontend)
            topServicos: topServicos.map(ts => ({
                ...ts,
                _sum: {
                    quantidade: ts._sum.quantidade || 0
                },
                _count: {
                    id: ts._count.id
                },
                servico: servicosDetalhes.find(s => s.id === ts.servicoId)
            })),
            // Top lavadores (formato compatível com frontend)
            topLavadores: topLavadores.map(tl => ({
                ...tl,
                _sum: {
                    valorTotal: tl._sum.valorTotal || 0
                },
                _count: {
                    id: tl._count.id
                },
                lavador: lavadoresDetalhes.find(l => l.id === tl.lavadorId)
            })),
            // Estatísticas de pagamentos
            pagamentosPorMetodo: pagamentosStats,
            valorPendente: pagamentosPendentes._sum.valor || 0,
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getOrdensStats = getOrdensStats;
/**
 * Deletar ordem de serviço permanentemente
 */
const deleteOrdem = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se ordem existe e pertence à empresa
        const ordem = await prisma.ordemServico.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        // Deletar pagamentos associados
        await prisma.pagamento.deleteMany({
            where: {
                ordemId: id
            }
        });
        // Deletar os itens da ordem primeiro (devido à restrição de chave estrangeira)
        await prisma.ordemServicoItem.deleteMany({
            where: {
                ordemId: id
            }
        });
        // Deletar a ordem
        await prisma.ordemServico.delete({
            where: {
                id
            }
        });
        res.json({
            message: 'Ordem de serviço deletada com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao deletar ordem de serviço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteOrdem = deleteOrdem;
//# sourceMappingURL=ordemController.js.map