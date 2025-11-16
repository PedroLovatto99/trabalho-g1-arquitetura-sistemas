// filepath: c:\Trabalho G1\payment\src\Application\rabbitmq\NotificationProducer.ts
import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'payment_notifications';

let channel: amqp.Channel | null = null;

async function connect() {
  if (channel) return;
  try {
    console.log('Connecting to RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('RabbitMQ connected.');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    // Em um ambiente de produção, você pode querer tentar reconectar
    throw error;
  }
}

export async function sendPaymentNotification(message: { orderId: string, userName: string }) {
  await connect();
  if (!channel) {
    throw new Error('RabbitMQ channel is not available.');
  }

  const messageBuffer = Buffer.from(JSON.stringify(message));
  channel.sendToQueue(QUEUE_NAME, messageBuffer, { persistent: true });
  console.log(`[x] Sent notification for order ${message.orderId}`);
}