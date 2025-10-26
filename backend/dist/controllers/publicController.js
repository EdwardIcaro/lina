"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdensByLavadorPublic = exports.getLavadorPublicData = void 0;
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Retorna os dados públicos de um lavador com base em um token JWT.
 * Esta rota não requer autenticação de empresa.
 */
const getLavadorPublicData = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'seu_segredo_jwt_aqui');
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
        const lavador = await db_1.default.lavador.findFirst({
            where: { id: lavadorId, empresaId },
            select: {
                id: true,
                nome: true,
                comissao: true,
                ordens: {
                    where: {
                        createdAt: {
                            gte: trintaDiasAtras, // Busca ordens dos últimos 30 dias
                            lte: hojeFim, // até o final de hoje
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
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};
exports.getLavadorPublicData = getLavadorPublicData;
const getOrdensByLavadorPublic = async (req, res) => {
    // Lógica existente...
};
exports.getOrdensByLavadorPublic = getOrdensByLavadorPublic;
//# sourceMappingURL=publicController.js.map