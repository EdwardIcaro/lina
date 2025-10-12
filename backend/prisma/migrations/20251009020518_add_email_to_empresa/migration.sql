/*
  Warnings:

  - You are about to drop the `categorias_veiculos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `precos_adicionais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `precos_servicos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoriaId` on the `veiculos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `empresas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `preco` to the `adicionais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco` to the `servicos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categorias_veiculos_nome_empresaId_key";

-- DropIndex
DROP INDEX "precos_adicionais_empresaId_adicionalId_categoriaId_key";

-- DropIndex
DROP INDEX "precos_servicos_empresaId_servicoId_categoriaId_key";

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN "email" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "categorias_veiculos";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "precos_adicionais";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "precos_servicos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "tipo_veiculos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "adicionais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_adicionais" ("ativo", "createdAt", "descricao", "empresaId", "id", "nome", "updatedAt") SELECT "ativo", "createdAt", "descricao", "empresaId", "id", "nome", "updatedAt" FROM "adicionais";
DROP TABLE "adicionais";
ALTER TABLE "new_adicionais" RENAME TO "adicionais";
CREATE TABLE "new_servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "duracao" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tipo_veiculo_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "servicos_tipo_veiculo_id_fkey" FOREIGN KEY ("tipo_veiculo_id") REFERENCES "tipo_veiculos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_servicos" ("ativo", "createdAt", "descricao", "duracao", "empresaId", "id", "nome", "updatedAt") SELECT "ativo", "createdAt", "descricao", "duracao", "empresaId", "id", "nome", "updatedAt" FROM "servicos";
DROP TABLE "servicos";
ALTER TABLE "new_servicos" RENAME TO "servicos";
CREATE TABLE "new_veiculos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT,
    "cor" TEXT,
    "ano" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "veiculos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_veiculos" ("ano", "clienteId", "cor", "createdAt", "id", "modelo", "placa", "updatedAt") SELECT "ano", "clienteId", "cor", "createdAt", "id", "modelo", "placa", "updatedAt" FROM "veiculos";
DROP TABLE "veiculos";
ALTER TABLE "new_veiculos" RENAME TO "veiculos";
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");
