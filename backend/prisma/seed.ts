import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed...');

  // --- 1. GARANTIR USUÁRIO E EMPRESA ---
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
  console.log(`-> Usuário "${usuario.nome}" garantido.`);

  const empresa = await prisma.empresa.upsert({
    where: { nome: 'Lava Jato Modelo' },
    update: {},
    create: {
      nome: 'Lava Jato Modelo',
      usuarioId: usuario.id,
    },
  });
  console.log(`-> Empresa "${empresa.nome}" garantida.`);

  // --- 2. LIMPAR DADOS ANTIGOS DA EMPRESA ---
  // Ordem de deleção é importante para não violar constraints
  await prisma.servico.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.tipoVeiculo.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.lavador.deleteMany({ where: { empresaId: empresa.id } });
  console.log('-> Dados antigos da empresa foram limpos.');

  // --- 3. CRIAR NOVOS DADOS ---

  // Lavador
  const lavador = await prisma.lavador.create({
    data: {
        nome: 'João Silva',
        comissao: 25,
        empresaId: empresa.id,
    }
  });
  console.log(`-> Lavador "${lavador.nome}" criado.`);

  // Tipos de Veículo
  const tipoCarro = await prisma.tipoVeiculo.create({
    data: { nome: 'Carro', categoria: 'Passeio', empresaId: empresa.id },
  });

  const tipoMoto = await prisma.tipoVeiculo.create({
    data: { nome: 'Moto', categoria: 'Urbana', empresaId: empresa.id },
  });
  console.log('-> Tipos de veículo criados.');

  // Serviços
  await prisma.servico.createMany({
    data: [
      {
        nome: 'Lavagem Simples',
        preco: 45.0,
        empresaId: empresa.id,
      },
      {
        nome: 'Lavagem Completa (com cera)',
        preco: 80.0,
        empresaId: empresa.id,
      },
      {
        nome: 'Lavagem de Moto',
        preco: 25.0,
        empresaId: empresa.id,
      },
      {
        nome: 'Polimento Cristalizado',
        preco: 250.0,
        empresaId: empresa.id,
      },
    ]
  });
  console.log('-> Serviços básicos criados.');

  // Associar serviços aos tipos de veículo
  const lavagemCarro = await prisma.servico.findFirst({ where: { nome: 'Lavagem Simples', empresaId: empresa.id }});
  const lavagemCompleta = await prisma.servico.findFirst({ where: { nome: 'Lavagem Completa (com cera)', empresaId: empresa.id }});
  const polimento = await prisma.servico.findFirst({ where: { nome: 'Polimento Cristalizado', empresaId: empresa.id }});
  const lavagemMoto = await prisma.servico.findFirst({ where: { nome: 'Lavagem de Moto', empresaId: empresa.id }});

  if(lavagemCarro) {
    await prisma.servico.update({
        where: { id: lavagemCarro.id }, 
        data: { tiposVeiculo: { connect: { id: tipoCarro.id } } }
    });
  }
  if(lavagemCompleta) {
    await prisma.servico.update({
        where: { id: lavagemCompleta.id }, 
        data: { tiposVeiculo: { connect: { id: tipoCarro.id } } }
    });
  }
  if(polimento) {
    await prisma.servico.update({
        where: { id: polimento.id }, 
        data: { tiposVeiculo: { connect: { id: tipoCarro.id } } }
    });
  }
  if(lavagemMoto) {
    await prisma.servico.update({
        where: { id: lavagemMoto.id }, 
        data: { tiposVeiculo: { connect: { id: tipoMoto.id } } }
    });
  }
  console.log('-> Serviços associados aos tipos de veículo.');


  console.log('
Seed concluído com sucesso! ✅');
}

main()
  .catch((e) => {
    console.error('Erro durante o processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });