"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategorias = void 0;
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const defaultCategories = [
    { nome: 'Moto' },
    { nome: 'Hatch' },
    { nome: 'Sedan' },
    { nome: 'SUV' },
    { nome: 'Picape' },
    { nome: 'Caminhonete' },
    { nome: 'Outros' },
];
/**
 * Listar categorias de veículo.
 * Cria as categorias padrão se não existirem para a empresa.
 */
const getCategorias = async (req, res) => {
    try {
        const empresaId = req.empresaId;
        let categorias = await prisma.categoriaVeiculo.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' },
        });
        // Se a empresa não tiver categorias, cria as padrão
        if (categorias.length === 0) {
            // Usar uma transação com `upsert` é mais robusto que `createMany` com `skipDuplicates`
            // e resolve o problema de tipagem do TypeScript.
            await prisma.$transaction(defaultCategories.map(cat => prisma.categoriaVeiculo.upsert({
                where: { nome_empresaId: { nome: cat.nome, empresaId } },
                update: {},
                create: {
                    nome: cat.nome,
                    empresaId: empresaId,
                },
            })));
            // Busca novamente para retornar a lista criada
            categorias = await prisma.categoriaVeiculo.findMany({
                where: { empresaId },
                orderBy: { nome: 'asc' },
            });
        }
        res.json({ categorias });
    }
    catch (error) {
        console.error('Erro ao listar/criar categorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getCategorias = getCategorias;
//# sourceMappingURL=categoriaController.js.map