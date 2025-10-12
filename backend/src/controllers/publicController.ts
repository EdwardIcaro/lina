import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Retorna as ordens de um lavador específico para a visualização pública.
 * Apenas campos não-sensíveis são retornados.
 */
export const getOrdensByLavadorPublic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID do Lavador
    const dateString = req.query.data as string; // Data para as ordens do dia
    const statusQuery = req.query.status as string; // Status, ex: "FINALIZADO,EM_ANDAMENTO"

    if (!id) {
      return res.status(400).json({ error: 'ID do lavador é obrigatório.' });
    }

    const statusList = statusQuery ? statusQuery.split(',') : ['FINALIZADO'];

    const whereClause: any = {
      lavadorId: id,
      status: { in: statusList }
    };

    // Se uma data for fornecida, filtra por ela. Senão, usa a data de hoje.
    const targetDate = dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? new Date(`${dateString}T00:00:00`) // Garante que a data seja interpretada no fuso horário local
      : new Date();

    whereClause.createdAt = {
      gte: startOfDay(targetDate),
      lte: endOfDay(targetDate),
    };

    const ordens = await prisma.ordemServico.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        valorTotal: true,
        createdAt: true,
        veiculo: {
          select: {
            placa: true,
            modelo: true,
          },
        },
        lavador: { // Incluindo para pegar a comissão
          select: {
            comissao: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcula e retorna os ganhos apenas se a requisição não for para uma data específica.
    // Isso acontece na primeira carga da página.
    if (!dateString) {
      const now = new Date();
      const calculateGains = async (startDate: Date) => {
        const result = await prisma.ordemServico.aggregate({
          where: {
            lavadorId: id,
            status: 'FINALIZADO',
            createdAt: {
              gte: startDate,
              lte: now,
            },
          },
          _sum: {
            valorTotal: true,
          },
        });
        return result._sum.valorTotal || 0;
      };

      const [daily, weekly, monthly] = await Promise.all([
        calculateGains(startOfDay(now)),
        calculateGains(subDays(now, 7)),
        calculateGains(subDays(now, 30)),
      ]);

      // Busca a comissão diretamente do cadastro do lavador para garantir precisão.
      const lavador = await prisma.lavador.findUnique({
        where: { id },
        select: { comissao: true },
      });
      const comissaoPercentual = lavador?.comissao ?? 0;

      return res.json({
        ordens,
        ganhos: {
          daily: daily * (comissaoPercentual / 100),
          weekly: weekly * (comissaoPercentual / 100),
          monthly: monthly * (comissaoPercentual / 100),
        },
      });
    }

    // Para requisições com data, retorna apenas as ordens.
    res.json({ ordens });
  } catch (error) {
    console.error('Erro ao buscar ordens públicas do lavador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};