// filepath: c:\Trabalho G1\orders\src\Data\Db\seed.ts
import mongoose from 'mongoose';
import  Order  from './Entities/OrderEntity';
import 'dotenv/config'; // Para carregar .env

// IDs fixos dos outros serviços para garantir consistência
const SEED_USER_ID = '25792b49-52ba-47ec-9a8d-c7c5fdb7a200';
const SEED_PRODUCT_ID = '88e1a0ce-c7ab-44ef-aab3-94761167770d';
export const SEED_ORDER_ID = new mongoose.Types.ObjectId('6920a5c7e79d84019ecc3470');

async function seed() {
  const MONGODB_URI = process.env.DATABASE_URL;
  if (!MONGODB_URI) {
    console.error("ERRO: 'DATABASE_URL' não está definida.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Seeding: Conectado ao MongoDB para seeding.');

    // Usamos 'updateOne' com 'upsert' para evitar duplicatas
    await Order.updateOne(
      { _id: SEED_ORDER_ID },
      {
        $setOnInsert: {
          _id: SEED_ORDER_ID,
          clientId: SEED_USER_ID,
          total: 99.99,
          status: 'PENDING_PAYMENT',
          products: [{
            productId: SEED_PRODUCT_ID,
            productName: 'Produto de Teste',
            quantity: 1,
            unitPrice: 99.99,
          }],
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    console.log('Seeding de Pedidos finalizado.');
  } catch (error) {
    console.error('Erro durante o seeding de pedidos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Seeding: Desconectado do MongoDB.');
  }
}

seed();