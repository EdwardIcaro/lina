import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Criar novo usuário
 */
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    const existingUsuario = await prisma.usuario.findFirst({
      where: { OR: [{ nome }, { email }] },
    });

    if (existingUsuario) {
      return res.status(400).json({ error: 'Usuário ou e-mail já cadastrado' });
    }

    const hashedSenha = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hashedSenha },
      select: { id: true, nome: true, email: true, createdAt: true },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso', usuario });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Autenticar usuário (login)
 */
export const authenticateUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { nome },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isSenhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!isSenhaValida) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    // Retorna dados do usuário e suas empresas associadas
    const empresas = await prisma.empresa.findMany({
      where: { usuarioId: usuario.id },
      select: { id: true, nome: true },
    });

    const { senha: _, ...usuarioData } = usuario;

    res.json({
      message: 'Autenticação realizada com sucesso',
      usuario: {
        ...usuarioData,
        empresas,
      },
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};