import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed...');

  // 1. Criar um usuário padrão para o seed
  const hashedUserPassword = await bcrypt.hash('123456', 12);
  const usuario = await prisma.usuario.upsert({
    where: { email: 'padrao@linax.com' },
    update: {},
    create: {
      nome: 'admin',
      email: 'padrao@linax.com',
      senha: hashedUserPassword,
    },
  });
  console.log(`Usuário "${usuario.nome}" garantido.`);

  // 2. Criar uma empresa padrão para o seed, associada ao usuário
  const empresa = await prisma.empresa.upsert({
    where: { nome: 'Empresa Padrão' },
    update: {},
    create: {
      nome: 'Empresa Padrão',
      usuarioId: usuario.id,
    },
  });
  console.log(`Empresa "${empresa.nome}" garantida.`);

  // 2. Definir os tipos de veículo associados a essa empresa
  const tiposVeiculoData = [
    // Tipos Principais (categoria null)
    { nome: 'Carro', categoria: null, descricao: 'Veículos de passeio em geral', empresaId: empresa.id },
    { nome: 'Moto', categoria: null, descricao: 'Motocicletas de todos os tipos', empresaId: empresa.id },
    { nome: 'Outros', categoria: null, descricao: 'Serviços avulsos e personalizados', empresaId: empresa.id },
    // Subtipos de Carro
    { nome: 'Hatch', categoria: 'Carro', descricao: 'Carros com traseira curta', empresaId: empresa.id },
    { nome: 'Sedan', categoria: 'Carro', descricao: 'Carros com porta-malas saliente', empresaId: empresa.id },
    { nome: 'SUV', categoria: 'Carro', descricao: 'Utilitários esportivos', empresaId: empresa.id },
    { nome: 'Picapé', categoria: 'Carro', descricao: 'Picapes e utilitários com caçamba', empresaId: empresa.id },
    { nome: 'Caminhonete', categoria: 'Carro', descricao: 'Veículos maiores com caçamba', empresaId: empresa.id },
  ];

  // 3. Usar `findFirst` e `create` para garantir a idempotência do seed,
  //    contornando o problema do `upsert` com campos nulos na constraint unique.
  for (const tipo of tiposVeiculoData) {
    const tipoExistente = await prisma.tipoVeiculo.findFirst({
      where: {
        empresaId: tipo.empresaId,
        nome: tipo.nome,
        categoria: tipo.categoria,
      },
    });

    if (!tipoExistente) {
      await prisma.tipoVeiculo.create({
        data: tipo,
      });
    }
  }

  console.log('Tipos de veículo padrão criados/garantidos.');

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });