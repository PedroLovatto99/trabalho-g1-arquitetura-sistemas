// 1. Mude de 'require' para 'import' (o padrão em TS)
//    e importe o tipo 'EachMessagePayload'
import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'estoque-consumer',
  brokers: ['localhost:9094']
});

const consumer = kafka.consumer({ groupId: 'grupo-estoque' });
const TOPIC_NAME = 'pedidos';

async function startConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

    console.log('[*] Serviço de Estoque conectado e esperando por eventos...');

await consumer.run({
 eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        
        // 1. ADICIONE ESTA VERIFICAÇÃO
        if (!message.value) {
          console.log('[!] [Estoque] Recebida mensagem com valor nulo (tombstone?), pulando.');
          return; // Para de processar esta mensagem
        }

        // 2. Agora o TS sabe que message.value não é nulo aqui
        const pedido = JSON.parse(message.value.toString());
        console.log(`[!] [Estoque] Recebido evento 'PedidoCriado' [ID: ${pedido.id}]. Atualizando o estoque...`);
        // Lógica de atualização do banco de dados de estoque aqui
      },
    });
    
  } catch (error) {
    console.error('Erro no consumidor de Estoque Kafka:', error);
    await consumer.disconnect();
    process.exit(1);
  }
}

startConsumer();