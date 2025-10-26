import { Request, Response, NextFunction } from 'express';
import prisma from '../db';

// const prisma = new PrismaClient(); // Removido para usar a instância global

// Interface para estender o Request com empresaId
interface EmpresaRequest extends Request {
  empresaId?: string;
  empresa?: any;
}

/**
 * Middleware de multi-empresa para isolamento de dados
 * Extrai o empresaId do header e valida se a empresa existe
 */
export const multiEmpresaMiddleware = async (
  req: EmpresaRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extrair empresaId do header
    const empresaId = req.headers['x-empresa-id'] as string;
    
    if (!empresaId) {
      return res.status(400).json({ 
        error: 'Empresa ID é obrigatório no header x-empresa-id' 
      });
    }

    // Validar se a empresa existe e está ativa
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        ativo: true
      }
    });

    if (!empresa) {
      return res.status(404).json({ 
        error: 'Empresa não encontrada ou inativa' 
      });
    }

    // Adicionar empresaId e empresa ao request para uso nos controllers
    req.empresaId = empresaId;
    req.empresa = empresa;

    next();
  } catch (error) {
    console.error('Erro no middleware de multi-empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware de autenticação simples.
 * Em um app real, aqui você validaria um token JWT.
 * Por agora, apenas garantimos que o multiEmpresaMiddleware foi executado.
 */
export const authMiddleware = (
  req: EmpresaRequest,
  res: Response,
  next: NextFunction
) => {
  // O multiEmpresaMiddleware já validou a empresa e adicionou o empresaId.
  // Se chegamos aqui, consideramos o usuário "autenticado" para o contexto da empresa.
  next();
};

/**
 * Middleware para validar senha chave da empresa
 * Usado no login e em operações sensíveis
 */
export const validateSenhaChave = async (
  req: EmpresaRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { senhaChave } = req.body;
    
    if (!senhaChave) {
      return res.status(400).json({ 
        error: 'Senha chave é obrigatória' 
      });
    }

    if (!req.empresa) {
      return res.status(400).json({ 
        error: 'Empresa não encontrada no contexto' 
      });
    }

    // Comparar senha chave (em produção, usar bcrypt)
    if (senhaChave !== req.empresa.senhaChave) {
      return res.status(401).json({ 
        error: 'Senha chave inválida' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação de senha chave:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Helper para criar filtro de empresa para queries Prisma
 */
export const createEmpresaFilter = (empresaId: string) => {
  return {
    empresaId: empresaId
  };
};

/**
 * Helper para verificar permissão de acesso a dados
 */
export const checkEmpresaPermission = (data: any, empresaId: string): boolean => {
  return data && data.empresaId === empresaId;
};
