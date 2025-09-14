import express from "express";
import { connectDB } from "./Data/Db/Mongo/mongo"; // Importe a função
import ordersRouter from "./Api/Controllers/OrdersController";

const app = express();
app.use(express.json());

// Conecta ao banco de dados antes de iniciar o servidor
connectDB();

app.use("/api/orders", ordersRouter);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Orders microservice running on http://localhost:${port}`);
});