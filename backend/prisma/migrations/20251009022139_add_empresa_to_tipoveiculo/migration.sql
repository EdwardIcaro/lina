/*
  Warnings:

  - Added the required column `empresaId` to the `tipo_veiculos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tipo_veiculos" (
    "empresaId" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tipo_veiculos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tipo_veiculos" ("ativo", "categoria", "createdAt", "descricao", "id", "nome", "updatedAt") SELECT "ativo", "categoria", "createdAt", "descricao", "id", "nome", "updatedAt" FROM "tipo_veiculos";
DROP TABLE "tipo_veiculos";
ALTER TABLE "new_tipo_veiculos" RENAME TO "tipo_veiculos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
