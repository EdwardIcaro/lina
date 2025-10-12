/*
  Warnings:

  - You are about to drop the column `preco` on the `adicionais` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `servicos` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "categorias_veiculos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    CONSTRAINT "categorias_veiculos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "precos_servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    CONSTRAINT "precos_servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "precos_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "precos_servicos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_veiculos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "precos_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "adicionalId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    CONSTRAINT "precos_adicionais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "precos_adicionais_adicionalId_fkey" FOREIGN KEY ("adicionalId") REFERENCES "adicionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "precos_adicionais_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_veiculos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_adicionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
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
    "duracao" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "categoriaId" TEXT,
    CONSTRAINT "veiculos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "veiculos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_veiculos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_veiculos" ("ano", "clienteId", "cor", "createdAt", "id", "modelo", "placa", "updatedAt") SELECT "ano", "clienteId", "cor", "createdAt", "id", "modelo", "placa", "updatedAt" FROM "veiculos";
DROP TABLE "veiculos";
ALTER TABLE "new_veiculos" RENAME TO "veiculos";
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "categorias_veiculos_empresaId_nome_key" ON "categorias_veiculos"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "precos_servicos_empresaId_servicoId_categoriaId_key" ON "precos_servicos"("empresaId", "servicoId", "categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "precos_adicionais_empresaId_adicionalId_categoriaId_key" ON "precos_adicionais"("empresaId", "adicionalId", "categoriaId");
