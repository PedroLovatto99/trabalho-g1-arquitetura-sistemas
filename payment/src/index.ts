import express from 'express';
import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';
import paymentRoutes from './Api/Controllers/PaymentController';
import { PaymentService } from './Application/Services/PaymentService';
import { PaymentRepository } from './Infrastucture/Repositories/PaymentRepository';
import { CreatePaymentDTO } from './Application/Dtos/PaymentDtos';
import { OrdersServiceHttpClient } from './External/apiOrders'; 
import { ProductServiceHttpClient } from './External/apiProducts';
import { UserApi } from './External/apiUsers';

// --- CONFIGURAÇÃO DO SERVIDOR EXPRESS ---
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/payments', paymentRoutes);

// --- CONFIGURAÇÃO DO KAFKA CONSUMER ---
const kafka = new Kafka({
  clientId: 'payment-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
});
const consumer = kafka.consumer({ groupId: 'payment-group' });

// --- LÓGICA DE NEGÓCIO (INSTÂNCIAS) ---
const prisma = new PrismaClient();

// CORRIGIDO: Instancia o repositório que estava faltando.
const paymentRepository = new PaymentRepository(prisma);

const orderApi = new OrdersServiceHttpClient(); 
const productApi = new ProductServiceHttpClient(); 
const userApi = new UserApi();

// Agora a variável 'paymentRepository' existe e pode ser passada para o serviço.
const paymentService = new PaymentService(paymentRepository, orderApi, productApi, userApi);


// --- FUNÇÃO DO CONSUMIDOR ---
async function startConsumer() {
  await consumer.connect();
  console.log('[KAFKA] Consumidor conectado.');

  await consumer.subscribe({ topic: 'pedidos', fromBeginning: true });
  console.log('[KAFKA] Inscrito no tópico "pedidos". Ouvindo mensagens...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;

        console.log(`[KAFKA] Mensagem recebida do tópico "${topic}"`);
        const payload = JSON.parse(message.value.toString());
        
        // 1. Log para ver os dados brutos que chegam
        console.log('[KAFKA] Payload:', payload);

        // 2. Mapeia a mensagem do Kafka para o formato que o serviço entende (DTO)
        const paymentDto: CreatePaymentDTO = {
          orderId: payload.id_order,
          clientId: payload.id_client,
          amountPaid: payload.valor,
          typePaymentIds: payload.met_pag, 
        };
        
        // 3. Chama o serviço para criar o pagamento no banco de dados
        await paymentService.create(paymentDto);

        console.log(`[+] Pagamento para o pedido ${payload.id_order} processado com sucesso.`);

      } catch (error) {
        console.error(`[!] Erro ao processar mensagem do Kafka para o pedido:`, error);
      }
    },
  });
}

// --- FUNÇÃO DE INICIALIZAÇÃO GERAL ---
const startServer = async () => {
    // Inicia o consumidor do Kafka em paralelo com o servidor web
    startConsumer().catch(err => {
      console.error("[KAFKA] Erro fatal no consumidor, a aplicação será encerrada.", err);
      process.exit(1);
    });

    app.listen(port, () => {
        console.log(`[HTTP] Payment microservice rodando em http://localhost:${port}`);
    });
};

startServer().catch(console.error);