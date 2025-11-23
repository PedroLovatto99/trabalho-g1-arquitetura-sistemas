// filepath: c:\Trabalho G1\users\src\Data\Db\prisma\seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ID Fixo para garantir consistência entre os serviços
export const SEED_USER_ID = '25792b49-52ba-47ec-9a8d-c7c5fdb7a200';

async function main() {
  console.log('Seeding: Tabela de Clientes (Users)...');

  // Usamos 'upsert' para evitar criar duplicatas se o seed for executado novamente
  await prisma.client.upsert({
    where: { id: SEED_USER_ID },
    update: {},
    create: {
      id: SEED_USER_ID,
      name: 'Cliente Teste',
      email: 'teste@exemplo.com',
    },
  });

  console.log('Seeding de Clientes finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });