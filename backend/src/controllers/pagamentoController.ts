import { Request, Response } from 'express';
import { PrismaClient, MetodoPagamento, StatusPagamento } from '../generated/prisma';

const prisma = new PrismaClient();

interface EmpresaRequest extends Request {
  empresaId?: string;
  empresa?: any;
}

/**
 * Criar novo pagamento
 */
export const createPagamento = async (req: EmpresaRequest, res: Response) => {
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
        empresaId: req.empresaId!,
        metodo: metodo as MetodoPagamento,
        valor,
        observacoes,
        status: metodo === 'PENDENTE' ? StatusPagamento.PENDENTE : StatusPagamento.PAGO,
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
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar pagamentos de uma ordem
 */
export const getPagamentosByOrdem = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar status de um pagamento
 */
export const updatePagamentoStatus = async (req: EmpresaRequest, res: Response) => {
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
        status: status as StatusPagamento,
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
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir um pagamento
 */
export const deletePagamento = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter estatísticas de pagamento
 */
export const getPaymentStats = async (req: EmpresaRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
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
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Função auxiliar para verificar e atualizar o status de pagamento de uma ordem
 */
async function verificarStatusPagamentoOrdem(ordemId: string) {
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

  if (!ordem) return;

  const totalPago = ordem.pagamentos.reduce((sum, pgto) => sum + pgto.valor, 0);
  const estaTotalmentePaga = totalPago >= ordem.valorTotal;

  await prisma.ordemServico.update({
    where: { id: ordemId },
    data: {
      pago: estaTotalmentePaga
    }
  });
}
