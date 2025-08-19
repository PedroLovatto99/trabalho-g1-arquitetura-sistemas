import express, { Express, Request, Response } from 'express';
import router from './Controllers/productController';

const app: Express = express();
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Olá, Mundo com TypeScript!');
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});


