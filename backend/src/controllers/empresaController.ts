import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface EmpresaRequest extends Request {
  usuarioId?: string;
  empresaId?: string;
}

/**
 * Criar nova empresa
 */
export const createEmpresa = async (req: EmpresaRequest, res: Response) => {
  try {
    const { nome } = req.body; 
    const usuarioId = req.usuarioId; // O ID do usuário virá do middleware

    // Validações básicas
    if (!nome) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar se empresa já existe
    const existingEmpresa = await prisma.empresa.findFirst({
      where: { nome, usuarioId },
    });

    if (existingEmpresa) {
      return res.status(400).json({ error: 'Empresa com este nome já existe para este usuário' });
    }

    // Criar empresa
    const empresa = await prisma.empresa.create({
      data: {
        nome,
        usuarioId,
        config: {
          moeda: 'BRL',
          timezone: 'America/Sao_Paulo'
        }
      },
      select: {
        id: true,
        nome: true,
        ativo: true,
        config: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // ** CRIAÇÃO AUTOMÁTICA DOS TIPOS DE VEÍCULO PADRÃO PARA A NOVA EMPRESA **
    const tiposVeiculoData = [
      // Tipos Principais (categoria null)
      { nome: 'Carro', categoria: null, descricao: 'Veículos de passeio em geral', empresaId: empresa.id },
      { nome: 'Moto', categoria: null, descricao: 'Motocicletas de todos os tipos', empresaId: empresa.id },
      { nome: 'Outros', categoria: null, descricao: 'Serviços avulsos e personalizados', empresaId: empresa.id },
      // Subtipos de Carro
      { nome: 'Hatch', categoria: 'Carro', descricao: 'Carros com traseira curta', empresaId: empresa.id },
      { nome: 'Sedan', categoria: 'Carro', descricao: 'Carros com porta-malas saliente', empresaId: empresa.id },
      { nome: 'SUV', categoria: 'Carro', descricao: 'Utilitários esportivos', empresaId: empresa.id },
      { nome: 'Picapé', categoria: 'Carro', descricao: 'Picapes e utilitários com caçamba', empresaId: empresa.id },
      { nome: 'Caminhonete', categoria: 'Carro', descricao: 'Veículos maiores com caçamba', empresaId: empresa.id },
    ];

    // Usamos `createMany` para inserir todos os tipos de uma vez de forma eficiente.
    // Como é uma empresa nova, não precisamos nos preocupar com duplicatas.
    await prisma.tipoVeiculo.createMany({
      data: tiposVeiculoData,
    });

    res.status(201).json({
      message: 'Empresa criada com sucesso',
      empresa
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar todas as empresas (apenas para admin)
 */
export const getEmpresas = async (req: EmpresaRequest, res: Response) => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const empresas = await prisma.empresa.findMany({
      where: { usuarioId },
      select: {
        id: true,
        nome: true,
        ativo: true,
        createdAt: true,
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
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Buscar empresa por ID
 */
export const getEmpresaById = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
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
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualizar empresa
 */
export const updateEmpresa = async (req: EmpresaRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, config } = req.body;

    // Verificar se empresa existe
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id }
    });

    if (!existingEmpresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (nome) updateData.nome = nome;
    if (config) updateData.config = config;

    const empresa = await prisma.empresa.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        ativo: true,
        config: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Empresa atualizada com sucesso',
      empresa
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Desativar/ativar empresa
 */
export const toggleEmpresaStatus = async (req: EmpresaRequest, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao alterar status da empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
