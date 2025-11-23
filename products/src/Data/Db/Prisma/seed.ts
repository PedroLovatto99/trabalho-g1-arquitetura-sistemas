// filepath: c:\Trabalho G1\products\src\Data\Db\Prisma\seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ID Fixo para garantir consistência
export const SEED_PRODUCT_ID = '88e1a0ce-c7ab-44ef-aab3-94761167770d';

async function main() {
  console.log('Seeding: Tabela de Produtos...');

  await prisma.product.upsert({
    where: { id: SEED_PRODUCT_ID },
    update: {},
    create: {
      id: SEED_PRODUCT_ID,
      name: 'Controle PS5',
      price: 299.99,
      stock: 12300,
    },
  });

  console.log('Seeding de Produtos finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });