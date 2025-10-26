import { Request, Response } from 'express';
import prisma from '../db';
import jwt from 'jsonwebtoken';

/**
 * Retorna os dados públicos de um lavador com base em um token JWT.
 * Esta rota não requer autenticação de empresa.
 */
export const getLavadorPublicData = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_aqui');
        const { lavadorId, empresaId } = decoded;

        if (!lavadorId || !empresaId) {
            return res.status(401).json({ error: 'Token inválido.' });
        }

        // Define o período dos últimos 30 dias para permitir cálculos semanais e mensais no frontend
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        trintaDiasAtras.setHours(0, 0, 0, 0);

        const hojeFim = new Date();
        hojeFim.setHours(23, 59, 59, 999);

        const lavador = await prisma.lavador.findFirst({
            where: { id: lavadorId, empresaId },
            select: {
                id: true,
                nome: true,
                comissao: true,
                ordens: { // O nome da relação no schema.prisma é 'ordens'
                    where: {
                        createdAt: {
                            gte: trintaDiasAtras, // Busca ordens dos últimos 30 dias
                            lte: hojeFim,       // até o final de hoje
                        },
                        status: { in: ['EM_ANDAMENTO', 'FINALIZADO'] }
                    },
                    include: {
                        veiculo: { select: { modelo: true, placa: true } },
                        items: {
                            include: {
                                servico: { select: { nome: true } },
                                adicional: { select: { nome: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!lavador) {
            return res.status(404).json({ error: 'Lavador não encontrado.' });
        }

        res.json({
            nome: lavador.nome,
            comissao: lavador.comissao,
            ordens: lavador.ordens, // Retorna todas as ordens do período
        });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

export const getOrdensByLavadorPublic = async (req: Request, res: Response) => {
    // Lógica existente...
};