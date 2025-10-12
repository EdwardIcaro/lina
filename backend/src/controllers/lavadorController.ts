import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface EmpresaRequest extends Request {
  empresaId?: string;
  empresa?: any;
}

/**
 * Criar novo lavador
 */
export const createLavador = async (req: EmpresaRequest, res: Response) => {
  try {
    const { nome, comissao } = req.body;

    if (!nome || comissao === undefined) {
      return res.status(400).json({ 
        error: 'Nome e comissão são obrigatórios' 
      });
    }

    // Validar comissão (entre 0 e 100)
    if (comissao < 0 || comissao > 100) {
      return res.status(400).json({ 
        error: 'Comissão deve estar entre 0 e 100' 
      });
    }

    const lavador = await prisma.lavador.create({
      data: {
        empresaId: req.empresaId!,
        nome,
        comissao
      },
      include: {
        _count: {
          select: {
            ordens: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Lavador criado com sucesso',
      lavador
    });
  } catch (error) {
    console.error('Erro ao criar lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar lavadores da empresa (com paginação)
 */
export const getLavadores = async (req: EmpresaRequest, res: Response) => {
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

    const [lavadores, total] = await Promise.all([
      prisma.lavador.findMany({
        where,
        include: {
          _count: {
            select: {
              ordens: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.lavador.count({ where })
    ]);

    res.json({
      lavadores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar lavadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar lavadores da empresa (formato simples para frontend)
 */
export const getLavadoresSimple = async (req: EmpresaRequest, res: Response) => {
  try {
    const { ativo } = req.query;

    const where: any = {
      empresaId: req.empresaId
    };

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const lavadores = await prisma.lavador.findMany({
      where,
      orderBy: {
        nome: 'asc'
      }
    });

    res.json({ lavadores });
  } catch (error) {
    console.error('Erro ao listar lavadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar lavador por ID
 */
export const getLavadorById = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lavador = await prisma.lavador.findFirst({
      where: {
        id,
        empresaId: req.empresaId
      },
      include: {
        ordens: {
          include: {
            cliente: {
              select: {
                nome: true
              }
            },
            veiculo: {
              select: {
                placa: true,
                modelo: true
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
            ordens: true
          }
        }
      }
    });

    if (!lavador) {
      return res.status(404).json({ error: 'Lavador não encontrado' });
    }

    // Calcular estatísticas
    const totalOrdens = lavador._count.ordens;
    const totalComissao = lavador.ordens.reduce((sum, ordem) => {
      return sum + (ordem.valorTotal * (lavador.comissao / 100));
    }, 0);

    res.json({
      ...lavador,
      estatisticas: {
        totalOrdens,
        totalComissao,
        mediaComissaoPorOrdem: totalOrdens > 0 ? totalComissao / totalOrdens : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar lavador
 */
export const updateLavador = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, comissao, ativo } = req.body;

    // Verificar se lavador existe e pertence à empresa
    const existingLavador = await prisma.lavador.findFirst({
      where: {
        id,
        empresaId: req.empresaId
      }
    });

    if (!existingLavador) {
      return res.status(404).json({ error: 'Lavador não encontrado' });
    }

    // Validar comissão se fornecida
    if (comissao !== undefined && (comissao < 0 || comissao > 100)) {
      return res.status(400).json({ 
        error: 'Comissão deve estar entre 0 e 100' 
      });
    }

    const lavador = await prisma.lavador.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(comissao !== undefined && { comissao }),
        ...(ativo !== undefined && { ativo })
      },
      include: {
        _count: {
          select: {
            ordens: true
          }
        }
      }
    });

    res.json({
      message: 'Lavador atualizado com sucesso',
      lavador
    });
  } catch (error) {
    console.error('Erro ao atualizar lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir lavador
 */
export const deleteLavador = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se lavador existe e pertence à empresa
    const lavador = await prisma.lavador.findFirst({
      where: {
        id,
        empresaId: req.empresaId
      },
      include: {
        _count: {
          select: {
            ordens: true
          }
        }
      }
    });

    if (!lavador) {
      return res.status(404).json({ error: 'Lavador não encontrado' });
    }

    // Não permitir excluir lavador com ordens de serviço
    if (lavador._count.ordens > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir lavador com ordens de serviço atribuídas' 
      });
    }

    await prisma.lavador.delete({
      where: { id }
    });

    res.json({
      message: 'Lavador excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Ativar/Desativar lavador
 */
export const toggleLavadorStatus = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lavador = await prisma.lavador.findFirst({
      where: {
        id,
        empresaId: req.empresaId
      }
    });

    if (!lavador) {
      return res.status(404).json({ error: 'Lavador não encontrado' });
    }

    const updatedLavador = await prisma.lavador.update({
      where: { id },
      data: {
        ativo: !lavador.ativo
      },
      include: {
        _count: {
          select: {
            ordens: true
          }
        }
      }
    });

    res.json({
      message: `Lavador ${updatedLavador.ativo ? 'ativado' : 'desativado'} com sucesso`,
      lavador: updatedLavador
    });
  } catch (error) {
    console.error('Erro ao alterar status do lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
