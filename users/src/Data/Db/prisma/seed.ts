// filepath: c:\Trabalho G1\users\src\Data\Db\prisma\seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ID Fixo para garantir consistência entre os serviços
export const SEED_USER_ID = 'a7846e57-c5c7-4741-bb67-32e70a617309';

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