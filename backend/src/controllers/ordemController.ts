import { Request, Response } from 'express';
import { PrismaClient, OrdemStatus, OrdemItemType } from '../generated/prisma';

const prisma = new PrismaClient();

interface EmpresaRequest extends Request {
  empresaId?: string;
}

/**
 * Criar nova ordem de serviço
 * Agora, esta função também pode criar um cliente e/ou veículo se eles não existirem.
 */
export const createOrdem = async (req: EmpresaRequest, res: Response) => {
  const empresaId = req.empresaId;
  if (!empresaId) {
    return res.status(401).json({ error: 'Empresa não autenticada' });
  }

  const {
    clienteId, novoCliente, veiculoId, novoVeiculo,
    lavadorId, itens, valorTotal, forcarCriacao
  } = req.body;

  // Validações
  if ((!clienteId && !novoCliente) || (!veiculoId && !novoVeiculo) || !itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos para criar a ordem.' });
  }

  try {
    // Utiliza uma transação para garantir a atomicidade da operação
    const ordem = await prisma.$transaction(async (tx) => {
      let finalClienteId: string | undefined = clienteId;
      let finalVeiculoId: string | undefined = veiculoId;

      // 1. Cria o cliente se for novo
      if (novoCliente && novoCliente.nome) {
        const clienteCriado = await tx.cliente.create({
          data: {
            nome: novoCliente.nome,
            telefone: novoCliente.telefone,
            empresaId,
          },
        });
        finalClienteId = clienteCriado.id;
      }

      // 2. Cria o veículo se for novo
      if (novoVeiculo && novoVeiculo.placa) {
        const veiculoCriado = await tx.veiculo.create({
          data: {
            placa: novoVeiculo.placa,
            modelo: novoVeiculo.modelo,
            clienteId: finalClienteId!,
          },
        });
        finalVeiculoId = veiculoCriado.id;
      }

      // 3. Verifica se já existe uma ordem ativa para o veículo
      if (!forcarCriacao) {
        const ordemAtiva = await tx.ordemServico.findFirst({
          where: {
            veiculoId: finalVeiculoId,
            empresaId,
            status: { in: ['PENDENTE', 'EM_ANDAMENTO'] },
          },
        });

        if (ordemAtiva) {
          // Lança um erro para abortar a transação
          throw { code: 'ACTIVE_ORDER_EXISTS' };
        }
      }

      // 4. Calcula o valor total e prepara os itens da ordem
      let calculatedValorTotal = 0;
      const ordemItemsData = await Promise.all(
        itens.map(async (item: any) => {
          let precoUnit = 0;
          if (item.tipo === 'SERVICO') {
            const servico = await tx.servico.findUnique({ where: { id: item.itemId } });
            if (servico) precoUnit = servico.preco;
          } else if (item.tipo === 'ADICIONAL') {
            const adicional = await tx.adicional.findUnique({ where: { id: item.itemId } });
            if (adicional) precoUnit = adicional.preco;
          }
          const subtotal = precoUnit * item.quantidade;
          calculatedValorTotal += subtotal;
          
          // CORREÇÃO: Mapeia o itemId para o campo correto (servicoId ou adicionalId)
          const itemData: any = {
            tipo: item.tipo,
            quantidade: item.quantidade,
            precoUnit,
            subtotal
          };
          if (item.tipo === 'SERVICO') itemData.servicoId = item.itemId;
          if (item.tipo === 'ADICIONAL') itemData.adicionalId = item.itemId;
          return itemData;
        })
      );

      // Add a final validation check before creating the order
      if (!finalClienteId || !finalVeiculoId) {
        throw new Error("ID do cliente ou do veículo não pôde ser determinado.");
      }

      // 5. Cria a ordem de serviço
      const novaOrdem = await tx.ordemServico.create({
        data: {
          empresaId,
          clienteId: finalClienteId,
          veiculoId: finalVeiculoId,
          lavadorId,
          valorTotal: calculatedValorTotal,
          status: lavadorId ? OrdemStatus.EM_ANDAMENTO : OrdemStatus.PENDENTE,
          items: { create: ordemItemsData },
        },
        include: {
          cliente: true,
          veiculo: true,
          lavador: true,
          items: { include: { servico: true, adicional: true } },
        },
      });

      return novaOrdem;
    });

    res.status(201).json({ message: 'Ordem de serviço criada com sucesso!', ordem });
  } catch (error: any) {
    if (error.code === 'ACTIVE_ORDER_EXISTS') {
      return res.status(409).json({
        error: 'Já existe uma ordem de serviço ativa para este veículo.',
        code: 'ACTIVE_ORDER_EXISTS',
      });
    }
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar ordens de serviço da empresa
 */
export const getOrdens = async (req: EmpresaRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      clienteId, 
      lavadorId,
      dataInicio,
      dataFim,
      metodoPagamento
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      empresaId: req.empresaId
    };

    if (search) {
      where.OR = [
        {
          cliente: {
            nome: { contains: search as string }
          }
        },
        {
          veiculo: {
            placa: { contains: search as string }
          }
        }
      ];
    }

    if (status) {
      const statusString = status as string;
      // Se o status for "ACTIVE", retorna todas, exceto as canceladas.
      if (statusString === 'ACTIVE') {
        where.status = { in: [OrdemStatus.PENDENTE, OrdemStatus.EM_ANDAMENTO] };
      } else if (statusString.includes(',')) {
        where.status = { in: statusString.split(',') as OrdemStatus[] };
      } else {
        // Caso contrário, filtra pelo status específico.
        where.status = statusString as OrdemStatus;
      }
    }

    if (clienteId) {
      where.clienteId = clienteId as string;
    }

    if (lavadorId) {
      where.lavadorId = lavadorId as string;
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim as string);
      }
    }

    if (metodoPagamento) {
      where.pagamentos = {
        some: {
          metodo: metodoPagamento as any
        }
      };
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
          },
          pagamentos: {
            orderBy: {
              createdAt: 'asc'
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
  } catch (error) {
    console.error('Erro ao listar ordens de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar ordem de serviço por ID
 */
export const getOrdemById = async (req: EmpresaRequest, res: Response) => {
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
          }
        },
        pagamentos: {
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
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar ordem de serviço
 */
export const updateOrdem = async (req: EmpresaRequest, res: Response) => {
  try {
    const updatedOrdemResult = await prisma.$transaction(async (tx) => {
      const { id } = req.params;
      const { status, lavadorId, observacoes, itens } = req.body;

      const existingOrdem = await tx.ordemServico.findFirst({
        where: { id, empresaId: req.empresaId },
      });

      if (!existingOrdem) {
        throw new Error('Ordem de serviço não encontrada'); // Lança um erro para ser pego pelo catch
      }

      let valorTotal = existingOrdem.valorTotal;
      const dataToUpdate: any = {
        observacoes,
        status,
        lavadorId,
      };

      if (itens && Array.isArray(itens)) {
        await tx.ordemServicoItem.deleteMany({ where: { ordemId: id } });

        valorTotal = 0;
        const itensData = [];

        for (const item of itens) {
          const { tipo, itemId, quantidade } = item;
          if (!tipo || !itemId || !quantidade || quantidade <= 0) {
            throw new Error('Cada item deve ter tipo, ID e quantidade válida');
          }

          let itemData;
          let precoUnitario = 0;

          if (tipo === OrdemItemType.SERVICO) {
            const servico = await tx.servico.findUnique({ where: { id: itemId, empresaId: req.empresaId } });
            if (!servico) throw new Error(`Serviço com ID ${itemId} não encontrado`);
            precoUnitario = servico.preco;
            itemData = { tipo: OrdemItemType.SERVICO, servicoId: itemId, quantidade, precoUnit: precoUnitario, subtotal: precoUnitario * quantidade };
          } else if (tipo === OrdemItemType.ADICIONAL) {
            const adicional = await tx.adicional.findUnique({ where: { id: itemId, empresaId: req.empresaId } });
            if (!adicional) throw new Error(`Adicional com ID ${itemId} não encontrado`);
            precoUnitario = adicional.preco;
            itemData = { tipo: OrdemItemType.ADICIONAL, adicionalId: itemId, quantidade, precoUnit: precoUnitario, subtotal: precoUnitario * quantidade };
          } else {
            throw new Error('Tipo de item inválido. Use SERVICO ou ADICIONAL');
          }

          itensData.push(itemData);
          valorTotal += itemData.subtotal;
        }
        dataToUpdate.items = { create: itensData };
        dataToUpdate.valorTotal = valorTotal;
      }

      if (status && status === 'FINALIZADO' && !existingOrdem.dataFim) {
        dataToUpdate.dataFim = new Date();
      }

      const ordem = await tx.ordemServico.update({
        where: { id },
        data: dataToUpdate,
        include: {
          cliente: { select: { id: true, nome: true, telefone: true } },
          veiculo: { select: { id: true, placa: true, modelo: true, cor: true } },
          lavador: { select: { id: true, nome: true, comissao: true } },
          items: { include: { servico: { select: { id: true, nome: true } }, adicional: { select: { id: true, nome: true } } } }
        },
      });

      return ordem;
    });

    res.json({ message: 'Ordem de serviço atualizada com sucesso', ordem: updatedOrdemResult });
  } catch (error: any) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(error.message === 'Ordem de serviço não encontrada' ? 404 : 500).json({ error: error.message || 'Erro interno do servidor' });
  }
};

/**
 * Cancelar ordem de serviço
 */
export const cancelOrdem = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao cancelar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter estatísticas de ordens de serviço
 */
export const getOrdensStats = async (req: EmpresaRequest, res: Response) => {
  try {
    const { dataInicio, dataFim, lavadorId, servicoId } = req.query;

    const where: any = {
      empresaId: req.empresaId,
      status: 'FINALIZADO' // Garante que todas as estatísticas sejam baseadas apenas em ordens finalizadas
    };

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim as string);
      }
    }

    if (lavadorId) {
      where.lavadorId = lavadorId as string;
    }

    if (servicoId) {
      where.items = {
        some: {
          servicoId: servicoId as string,
          tipo: 'SERVICO'
        }
      };
    }

    // Primeiro, obter os IDs das ordens que atendem aos critérios
    const ordensIds = await prisma.ordemServico.findMany({
      where,
      select: { id: true }
    });

    const ordensIdsList = ordensIds.map(o => o.id);

    const [
      ordensPorStatus,
      valorTotal,
      ordensFinalizadas,
      topServicos,
      topLavadores
    ] = await Promise.all([
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
        where: where // O status já está no 'where' principal
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
          id: { in: topServicos.map(s => s.servicoId!).filter(Boolean) }
        },
        select: {
          id: true,
          nome: true
        }
      }),
      
      prisma.lavador.findMany({
        where: {
          id: { in: topLavadores.map(l => l.lavadorId!).filter(Boolean) }
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
            empresaId: req.empresaId!,
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
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Deletar ordem de serviço permanentemente
 */
export const deleteOrdem = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};