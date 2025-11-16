import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const QUEUE_NAME = 'payment_notifications';

interface PaymentMessage {
  orderId: string;
  userName: string;
}

async function startConsumer() {
  console.log('Starting notification consumer...');
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    console.log(`[*] Waiting for messages in queue: ${QUEUE_NAME}.`);

    channel.consume(QUEUE_NAME, (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString()) as PaymentMessage;
          console.log(`[x] Received message for order ${content.orderId}`);
          
          console.log(`--> NOTIFICATION: ${content.userName}, seu pedido foi PAGO com sucesso e será despachado em breve.`);
          
          channel.ack(msg);
        } catch (e) {
          console.error('Error processing message:', e);
          channel.nack(msg, false, false);
        }
      }
    }, { noAck: false });

  } catch (error) {
    console.error('Consumer failed to start, retrying in 5s...', error);
    setTimeout(startConsumer, 5000);
  }
}

startConsumer();