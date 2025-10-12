"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStats = exports.deletePagamento = exports.updatePagamentoStatus = exports.getPagamentosByOrdem = exports.createPagamento = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
/**
 * Criar novo pagamento
 */
const createPagamento = async (req, res) => {
    try {
        const { ordemId, metodo, valor, observacoes } = req.body;
        if (!ordemId || !metodo || !valor) {
            return res.status(400).json({
                error: 'Ordem ID, método e valor são obrigatórios'
            });
        }
        // Verificar se ordem existe e pertence à empresa
        const ordem = await prisma.ordemServico.findFirst({
            where: {
                id: ordemId,
                empresaId: req.empresaId
            }
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        // Validar método de pagamento
        const metodosValidos = ['DINHEIRO', 'PIX', 'CARTAO', 'PENDENTE'];
        if (!metodosValidos.includes(metodo)) {
            return res.status(400).json({
                error: `Método inválido. Use: ${metodosValidos.join(', ')}`
            });
        }
        // Validar valor
        if (valor <= 0) {
            return res.status(400).json({ error: 'Valor deve ser maior que zero' });
        }
        // Criar pagamento
        const pagamento = await prisma.pagamento.create({
            data: {
                ordemId,
                empresaId: req.empresaId,
                metodo: metodo,
                valor,
                observacoes,
                status: metodo === 'PENDENTE' ? prisma_1.StatusPagamento.PENDENTE : prisma_1.StatusPagamento.PAGO,
                pagoEm: metodo === 'PENDENTE' ? null : new Date()
            },
            include: {
                ordem: {
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
                        }
                    }
                }
            }
        });
        // Verificar se a ordem está totalmente paga
        await verificarStatusPagamentoOrdem(ordemId);
        res.status(201).json(pagamento);
    }
    catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createPagamento = createPagamento;
/**
 * Listar pagamentos de uma ordem
 */
const getPagamentosByOrdem = async (req, res) => {
    try {
        const { ordemId } = req.params;
        // Verificar se ordem existe e pertence à empresa
        const ordem = await prisma.ordemServico.findFirst({
            where: {
                id: ordemId,
                empresaId: req.empresaId
            }
        });
        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }
        const pagamentos = await prisma.pagamento.findMany({
            where: {
                ordemId,
                empresaId: req.empresaId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(pagamentos);
    }
    catch (error) {
        console.error('Erro ao listar pagamentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getPagamentosByOrdem = getPagamentosByOrdem;
/**
 * Atualizar status de um pagamento
 */
const updatePagamentoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Verificar se pagamento existe e pertence à empresa
        const pagamento = await prisma.pagamento.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        // Validar status
        const statusValidos = ['PENDENTE', 'PAGO', 'CANCELADO'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                error: `Status inválido. Use: ${statusValidos.join(', ')}`
            });
        }
        const updatedPagamento = await prisma.pagamento.update({
            where: { id },
            data: {
                status: status,
                pagoEm: status === 'PAGO' ? new Date() : null
            },
            include: {
                ordem: {
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
                        }
                    }
                }
            }
        });
        // Verificar se a ordem está totalmente paga
        await verificarStatusPagamentoOrdem(pagamento.ordemId);
        res.json(updatedPagamento);
    }
    catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updatePagamentoStatus = updatePagamentoStatus;
/**
 * Excluir um pagamento
 */
const deletePagamento = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se pagamento existe e pertence à empresa
        const pagamento = await prisma.pagamento.findFirst({
            where: {
                id,
                empresaId: req.empresaId
            }
        });
        if (!pagamento) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }
        await prisma.pagamento.delete({
            where: { id }
        });
        // Verificar se a ordem ainda está totalmente paga
        await verificarStatusPagamentoOrdem(pagamento.ordemId);
        res.json({ message: 'Pagamento excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deletePagamento = deletePagamento;
/**
 * Obter estatísticas de pagamento
 */
const getPaymentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        }
        // Total de pagamentos por método
        const pagamentosPorMetodo = await prisma.pagamento.groupBy({
            by: ['metodo'],
            where: {
                empresaId: req.empresaId,
                status: 'PAGO',
                ...dateFilter
            },
            _sum: {
                valor: true
            },
            _count: {
                _all: true
            }
        });
        // Total de pagamentos por status
        const pagamentosPorStatus = await prisma.pagamento.groupBy({
            by: ['status'],
            where: {
                empresaId: req.empresaId,
                ...dateFilter
            },
            _sum: {
                valor: true
            },
            _count: {
                _all: true
            }
        });
        // Pagamentos pendentes
        const pagamentosPendentes = await prisma.pagamento.findMany({
            where: {
                empresaId: req.empresaId,
                status: 'PENDENTE',
                ...dateFilter
            },
            include: {
                ordem: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nome: true,
                                telefone: true
                            }
                        }
                    }
                }
            }
        });
        res.json({
            porMetodo: pagamentosPorMetodo,
            porStatus: pagamentosPorStatus,
            pendentes: pagamentosPendentes
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getPaymentStats = getPaymentStats;
/**
 * Função auxiliar para verificar e atualizar o status de pagamento de uma ordem
 */
async function verificarStatusPagamentoOrdem(ordemId) {
    const ordem = await prisma.ordemServico.findUnique({
        where: { id: ordemId },
        include: {
            pagamentos: {
                where: {
                    status: 'PAGO'
                }
            }
        }
    });
    if (!ordem)
        return;
    const totalPago = ordem.pagamentos.reduce((sum, pgto) => sum + pgto.valor, 0);
    const estaTotalmentePaga = totalPago >= ordem.valorTotal;
    await prisma.ordemServico.update({
        where: { id: ordemId },
        data: {
            pago: estaTotalmentePaga
        }
    });
}
//# sourceMappingURL=pagamentoController.js.map