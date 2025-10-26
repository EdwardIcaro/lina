import { PrismaClient } from '@prisma/client';

// Cria e exporta uma única instância do PrismaClient para ser usada em toda a aplicação.
const prisma = new PrismaClient();

export default prisma;