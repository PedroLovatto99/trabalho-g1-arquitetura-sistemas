import express from "express"; // Importe a função
import ordersRouter from "./Api/Controllers/OrdersController";

const app = express();
app.use(express.json());

app.use("/api/orders", ordersRouter);

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Orders microservice running on http://localhost:${port}`);
});