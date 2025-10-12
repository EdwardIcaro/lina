-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ordens_servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "lavadorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" REAL NOT NULL,
    "observacoes" TEXT,
    "dataInicio" DATETIME,
    "dataFim" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ordens_servico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_lavadorId_fkey" FOREIGN KEY ("lavadorId") REFERENCES "lavadores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ordens_servico" ("clienteId", "createdAt", "dataFim", "dataInicio", "empresaId", "id", "lavadorId", "observacoes", "status", "updatedAt", "valorTotal", "veiculoId") SELECT "clienteId", "createdAt", "dataFim", "dataInicio", "empresaId", "id", "lavadorId", "observacoes", "status", "updatedAt", "valorTotal", "veiculoId" FROM "ordens_servico";
DROP TABLE "ordens_servico";
ALTER TABLE "new_ordens_servico" RENAME TO "ordens_servico";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
