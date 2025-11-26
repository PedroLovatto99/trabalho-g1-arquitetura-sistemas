import { createClient } from 'redis';

// A URL virá da variável de ambiente que configuramos no docker-compose
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Conecta ao Redis assim que a aplicação iniciar
redisClient.connect().catch(console.error);

export default redisClient;