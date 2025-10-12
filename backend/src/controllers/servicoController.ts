import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface EmpresaRequest extends Request {
  empresaId?: string;
  empresa?: any;
}


/**
 * Criar novo serviço
 */
export const createServico = async (req: EmpresaRequest, res: Response) => {
  try {
    const { nome, descricao, duracao, preco, tipoVeiculoId } = req.body;

    if (!nome || preco === undefined || !tipoVeiculoId) {
      return res.status(400).json({ 
        error: 'Nome, preço e tipo de veículo são obrigatórios' 
      });
    }

    // Verificar se o tipo de veículo existe
    const tipoVeiculo = await prisma.tipoVeiculo.findUnique({
      where: { id: tipoVeiculoId }
    });

    if (!tipoVeiculo) {
      return res.status(400).json({ error: 'Tipo de veículo não encontrado' });
    }

    const novoServico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        duracao,
        preco: parseFloat(preco),
        empresaId: req.empresaId!,
        tipoVeiculoId
      }
    });

    res.status(201).json({
      message: 'Serviço criado com sucesso',
      servico: novoServico
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Criar novo serviço adicional
 */
export const createAdicional = async (req: EmpresaRequest, res: Response) => {
  try {
    const { nome, descricao, preco } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({ 
        error: 'Nome e preço são obrigatórios' 
      });
    }

    const novoAdicional = await prisma.adicional.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        empresaId: req.empresaId!
      }
    });

    res.status(201).json({
      message: 'Serviço adicional criado com sucesso',
      adicional: novoAdicional
    });
  } catch (error) {
    console.error('Erro ao criar serviço adicional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar serviços da empresa (com paginação)
 */
export const getServicos = async (req: EmpresaRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, ativo, tipoVeiculoId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      empresaId: req.empresaId
    };

    if (search) {
      where.nome = { contains: search as string };
    }

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    if (tipoVeiculoId) {
      where.tipoVeiculoId = tipoVeiculoId as string;
    }

    const [servicos, total] = await Promise.all([
      prisma.servico.findMany({
        where,
        include: {
          tipoVeiculo: true,
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
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar serviços da empresa (formato simples para frontend)
 */
export const getServicosSimple = async (req: EmpresaRequest, res: Response) => {
  try {
    const { ativo } = req.query;

    const where: any = {
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

    res.json({ servicos });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar serviços adicionais da empresa (formato simples para frontend)
 */
export const getAdicionaisSimple = async (req: EmpresaRequest, res: Response) => {
  try {
    const { ativo } = req.query;

    const where: any = {
      empresaId: req.empresaId
    };

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const adicionais = await prisma.adicional.findMany({
      where,
      orderBy: {
        nome: 'asc'
      }
    });

    res.json({ adicionais });
  } catch (error) {
    console.error('Erro ao listar serviços adicionais (simples):', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
/**
 * Listar serviços adicionais da empresa
 */
export const getAdicionais = async (req: EmpresaRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, ativo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      empresaId: req.empresaId
    };

    if (search) {
      where.nome = { contains: search as string };
    }

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const [adicionais, total] = await Promise.all([
      prisma.adicional.findMany({
        where,
        include: {
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
  } catch (error) {
    console.error('Erro ao listar serviços adicionais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar serviço por ID
 */
export const getServicoById = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar serviço adicional por ID
 */
export const getAdicionalById = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;

    const adicional = await prisma.adicional.findFirst({
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

    if (!adicional) {
      return res.status(404).json({ error: 'Serviço adicional não encontrado' });
    }

    res.json(adicional);
  } catch (error) {
    console.error('Erro ao buscar serviço adicional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar serviço
 */
export const updateServico = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, duracao, ativo, preco } = req.body;

    const servico = await prisma.servico.updateMany({
      where: {
        id,
        empresaId: req.empresaId
      },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(duracao !== undefined && { duracao }),
        ...(ativo !== undefined && { ativo }),
        ...(preco !== undefined && { preco: parseFloat(preco) })
      }
    });

    if (servico.count === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado ou não pertence à empresa' });
    }

    const servicoAtualizado = await prisma.servico.findUnique({ where: { id } });

    res.json({
      message: 'Serviço atualizado com sucesso',
      servico: servicoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar serviço adicional
 */
export const updateAdicional = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo, preco } = req.body;

    const adicional = await prisma.adicional.updateMany({
      where: {
        id,
        empresaId: req.empresaId
      },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo }),
        ...(preco !== undefined && { preco: parseFloat(preco) })
      }
    });

    if (adicional.count === 0) {
      return res.status(404).json({ error: 'Serviço adicional não encontrado ou não pertence à empresa' });
    }

    const adicionalAtualizado = await prisma.adicional.findUnique({ where: { id } });

    res.json({
      message: 'Serviço adicional atualizado com sucesso',
      adicional: adicionalAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço adicional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir serviço
 */
export const deleteServico = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir serviço adicional
 */
export const deleteAdicional = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao excluir serviço adicional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};