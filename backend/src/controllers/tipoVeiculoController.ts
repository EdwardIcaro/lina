import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Inicialização do cliente Prisma para conexão com o banco de dados

interface EmpresaRequest extends Request {
  empresaId?: string;
  empresa?: any;
}

/**
 * Criar novo tipo de veículo
 */
export const createTipoVeiculo = async (req: EmpresaRequest, res: Response) => {
  try {
    const { nome, categoria, descricao, ativo } = req.body;

    if (!nome) {
      return res.status(400).json({ 
        error: 'Nome é obrigatório' 
      });
    }

    const novoTipoVeiculo = await prisma.tipoVeiculo.create({
      data: {
        empresaId: req.empresaId!,
        nome,
        categoria,
        descricao,
        ativo
      }
    });

    res.status(201).json({
      message: 'Tipo de veículo criado com sucesso',
      tipoVeiculo: novoTipoVeiculo
    });
  } catch (error) {
    console.error('Erro ao criar tipo de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar tipos de veículo (com paginação)
 */
export const getTiposVeiculo = async (req: EmpresaRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, ativo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.TipoVeiculoWhereInput = {
      empresaId: req.empresaId
    };

    if (search) {
      where.OR = [
        { nome: { contains: search as string } },
        { categoria: { contains: search as string } }
      ];
    }

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const [tiposVeiculo, total] = await Promise.all([
      prisma.tipoVeiculo.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome: 'asc' }
      }),
      prisma.tipoVeiculo.count({ where })
    ]);

    res.status(200).json({
      tiposVeiculo,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar tipos de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Obter tipo de veículo por ID
 */
export const getTipoVeiculoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tipoVeiculo = await prisma.tipoVeiculo.findUnique({
      where: { id },
      include: {
        servicos: true
      }
    });

    if (!tipoVeiculo) {
      return res.status(404).json({ error: 'Tipo de veículo não encontrado' });
    }

    res.status(200).json(tipoVeiculo);
  } catch (error) {
    console.error('Erro ao buscar tipo de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar tipo de veículo
 */
export const updateTipoVeiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, categoria, descricao, ativo } = req.body;

    const tipoVeiculo = await prisma.tipoVeiculo.findUnique({
      where: { id }
    });

    if (!tipoVeiculo) {
      return res.status(404).json({ error: 'Tipo de veículo não encontrado' });
    }

    const tipoVeiculoAtualizado = await prisma.tipoVeiculo.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(categoria !== undefined && { categoria }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo })
      }
    });

    res.status(200).json({
      message: 'Tipo de veículo atualizado com sucesso',
      tipoVeiculo: tipoVeiculoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar tipo de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Excluir tipo de veículo
 */
export const deleteTipoVeiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o tipo de veículo está sendo usado em algum serviço
    const servicosComTipo = await prisma.servico.count({
      where: {
        tipoVeiculoId: id
      }
    });

    if (servicosComTipo > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este tipo de veículo pois existem serviços associados a ele' 
      });
    }

    await prisma.tipoVeiculo.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Tipo de veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tipo de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar subtipos de veículo (categorias) por tipo
 */
export const getSubtiposByTipo = async (req: EmpresaRequest, res: Response) => {
  try {
    const { categoria } = req.params;

    const subtipos = await prisma.tipoVeiculo.findMany({
      where: {
        empresaId: req.empresaId,
        categoria: categoria,
      },
      select: {
        id: true,
        nome: true,
        categoria: true,
        descricao: true
      }
    });

    res.status(200).json(subtipos);
  } catch (error) {
    console.error('Erro ao listar subtipos de veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};