import express from 'express';
import { Kafka, Producer, Message } from 'kafkajs';
import mongoose from './Data/Db/Configurations/mongoose';
import orderRoutes from './Api/Controllers/OrdersController';

// --- CONFIGURAÇÃO DO KAFKA PRODUCER (Mantida como você pediu) ---
const kafka = new Kafka({
  clientId: 'pedido-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9094'],
});

export const producer: Producer = kafka.producer();
export const TOPIC_NAME = 'pedidos';

// Exemplo de mensagem a ser enviada pelo setInterval
const message: Message = {
  key: 'teste',
  value: 'Essa é uma mensagem de teste do setInterval!',
};

async function startProducer() {
  try {
    await producer.connect();
    console.log('[KAFKA] Produtor conectado. O envio periódico de teste será iniciado.');

    // MANTIDO: O setInterval que envia uma mensagem de teste a cada 5 segundos.
    // setInterval(() => {
    //   producer.send({
    //     topic: TOPIC_NAME,
    //     messages: [message],
    //   });
    //   console.log('[KAFKA TEST] Mensagem de teste enviada via setInterval.');
    // }, 5000);

  } catch (error) {
    console.error('[KAFKA] Erro ao conectar o produtor:', error);
    process.exit(1);
  }
}

// --- CONFIGURAÇÃO DO SERVIDOR EXPRESS ---
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/orders', orderRoutes);

// --- FUNÇÃO DE INICIALIZAÇÃO ---
const startServer = async () => {
    await mongoose; // Conecta ao banco de dados
    await startProducer(); // Conecta o producer do Kafka e inicia o setInterval
    app.listen(port, () => {
        console.log(`[HTTP] Orders microservice rodando em http://localhost:${port}`);
    });
};

startServer().catch(console.error);