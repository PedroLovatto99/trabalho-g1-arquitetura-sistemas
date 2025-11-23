import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o processo de seeding...');

  await prisma.status.createMany({
    data: [
      { id: 1, name: 'AGUARDANDO PAGAMENTO' },
      { id: 2, name: 'PAGO' },
      { id: 3, name: 'FALHA NO PAGAMENTO' },
      { id: 4, name: 'CANCELADO' },
    ],
    skipDuplicates: true,
  });

  await prisma.typePayment.createMany({
    data: [
      { id: "1", name: 'PIX' },
      { id: "2", name: 'CARTAO DE CREDITO' },
      { id: "3", name: 'BOLETO' },
    ],
    skipDuplicates: true,
  });

 const SEED_USER_ID = '25792b49-52ba-47ec-9a8d-c7c5fdb7a200'; // ajustar conforme users seed
  const SEED_ORDER_ID = '6920a5c7e79d84019ecc3470'; // id do pedido (string) usado no orders seed

  // upsert do payment conectando relações (usa connect para status e paymentMethods)
  await prisma.payment.upsert({
    where: { orderId: SEED_ORDER_ID }, // orderId deve ser unique no schema
    update: {},
    create: {
      orderId: SEED_ORDER_ID,
      clientId: SEED_USER_ID,
      amountPaid: 79.99,
      status: { connect: { id: 1 } }, // AGUARDANDO PAGAMENTO
      typePayments: { connect: [{ id: '1' }] }, // conecta PIX (id 1)
      // ajuste outros campos se necessário (paidAt, createdAt implicitamente gerados)
    },
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