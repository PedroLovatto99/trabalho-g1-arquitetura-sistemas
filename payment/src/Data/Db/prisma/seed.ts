import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seeding...');

  await prisma.typePayment.createMany({
    data: [
      { id: '1', name: 'PIX' },
      { id: '2', name: 'CARTAO DE CREDITO' },
      { id: '3', name: 'BOLETO' },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding finalizado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });