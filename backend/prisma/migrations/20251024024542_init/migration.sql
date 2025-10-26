-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "horarioAbertura" TEXT,
    "horarioFechamento" TEXT,
    "finalizacaoAutomatica" BOOLEAN DEFAULT false,
    "exigirLavadorParaFinalizar" BOOLEAN DEFAULT false,
    "paginaInicialPadrao" TEXT DEFAULT 'index.html',
    "notificationPreferences" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "empresas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "veiculos" (
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

-- CreateTable
CREATE TABLE "lavadores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "comissao" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lavadores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fornecedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fechamentos_caixa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faturamentoDia" REAL NOT NULL,
    "pix" REAL NOT NULL,
    "dinheiro" REAL NOT NULL,
    "cartao" REAL NOT NULL,
    "diferenca" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fechamentos_caixa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaixaRegistro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'SAIDA',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" REAL NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "lavadorId" TEXT,
    "descricao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaixaRegistro_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaixaRegistro_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaixaRegistro_lavadorId_fkey" FOREIGN KEY ("lavadorId") REFERENCES "lavadores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tipo_veiculos" (
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

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "duracao" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "adicionais" (
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

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOrdem" INTEGER NOT NULL,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "lavadorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" REAL NOT NULL,
    "observacoes" TEXT,
    "dataInicio" DATETIME,
    "dataFim" DATETIME,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "comissao" REAL NOT NULL DEFAULT 0,
    "comissaoPaga" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fechamentoComissaoId" TEXT,
    CONSTRAINT "ordens_servico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_lavadorId_fkey" FOREIGN KEY ("lavadorId") REFERENCES "lavadores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_fechamentoComissaoId_fkey" FOREIGN KEY ("fechamentoComissaoId") REFERENCES "fechamentos_comissao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordens_servico_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "servicoId" TEXT,
    "adicionalId" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnit" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ordens_servico_items_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordens_servico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_items_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_items_adicionalId_fkey" FOREIGN KEY ("adicionalId") REFERENCES "adicionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ordemId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "pagoEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pagamentos_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordens_servico" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pagamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "adiantamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "lavadorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "caixaRegistroId" TEXT,
    "fechamentoComissaoId" TEXT,
    CONSTRAINT "adiantamentos_lavadorId_fkey" FOREIGN KEY ("lavadorId") REFERENCES "lavadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "adiantamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "adiantamentos_caixaRegistroId_fkey" FOREIGN KEY ("caixaRegistroId") REFERENCES "CaixaRegistro" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "adiantamentos_fechamentoComissaoId_fkey" FOREIGN KEY ("fechamentoComissaoId") REFERENCES "fechamentos_comissao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fechamentos_comissao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorPago" REAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "lavadorId" TEXT NOT NULL,
    CONSTRAINT "fechamentos_comissao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fechamentos_comissao_lavadorId_fkey" FOREIGN KEY ("lavadorId") REFERENCES "lavadores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ServicoToTipoVeiculo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ServicoToTipoVeiculo_A_fkey" FOREIGN KEY ("A") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ServicoToTipoVeiculo_B_fkey" FOREIGN KEY ("B") REFERENCES "tipo_veiculos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nome_key" ON "usuarios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nome_key" ON "empresas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "lavadores_nome_empresaId_key" ON "lavadores"("nome", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_empresaId_nome_key" ON "fornecedores"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_veiculos_empresaId_nome_categoria_key" ON "tipo_veiculos"("empresaId", "nome", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_empresaId_numeroOrdem_key" ON "ordens_servico"("empresaId", "numeroOrdem");

-- CreateIndex
CREATE UNIQUE INDEX "adiantamentos_caixaRegistroId_key" ON "adiantamentos"("caixaRegistroId");

-- CreateIndex
CREATE UNIQUE INDEX "_ServicoToTipoVeiculo_AB_unique" ON "_ServicoToTipoVeiculo"("A", "B");

-- CreateIndex
CREATE INDEX "_ServicoToTipoVeiculo_B_index" ON "_ServicoToTipoVeiculo"("B");
