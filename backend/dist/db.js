"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Cria e exporta uma única instância do PrismaClient para ser usada em toda a aplicação.
const prisma = new client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=db.js.map