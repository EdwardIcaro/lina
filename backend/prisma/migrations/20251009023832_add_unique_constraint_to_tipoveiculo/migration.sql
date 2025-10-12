/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,nome,categoria]` on the table `tipo_veiculos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tipo_veiculos_empresaId_nome_categoria_key" ON "tipo_veiculos"("empresaId", "nome", "categoria");
