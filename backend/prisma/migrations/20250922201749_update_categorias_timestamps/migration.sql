/*
  Warnings:

  - Added the required column `updated_at` to the `categorias_veiculos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categorias_veiculos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "empresaId" TEXT NOT NULL,
    CONSTRAINT "categorias_veiculos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_categorias_veiculos" ("empresaId", "id", "nome") SELECT "empresaId", "id", "nome" FROM "categorias_veiculos";
DROP TABLE "categorias_veiculos";
ALTER TABLE "new_categorias_veiculos" RENAME TO "categorias_veiculos";
CREATE UNIQUE INDEX "categorias_veiculos_nome_empresaId_key" ON "categorias_veiculos"("nome", "empresaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
