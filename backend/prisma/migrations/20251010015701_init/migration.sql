/*
  Warnings:

  - You are about to drop the column `email` on the `empresas` table. All the data in the column will be lost.
  - You are about to drop the column `senhaChave` on the `empresas` table. All the data in the column will be lost.
  - Added the required column `usuarioId` to the `empresas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_empresas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "empresas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_empresas" ("ativo", "cnpj", "config", "createdAt", "id", "nome", "updatedAt") SELECT "ativo", "cnpj", "config", "createdAt", "id", "nome", "updatedAt" FROM "empresas";
DROP TABLE "empresas";
ALTER TABLE "new_empresas" RENAME TO "empresas";
CREATE UNIQUE INDEX "empresas_nome_key" ON "empresas"("nome");
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nome_key" ON "usuarios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
