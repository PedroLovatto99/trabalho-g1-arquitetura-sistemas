import express from "express";
import 'dotenv/config'
import ordersRouter from "./Api/Controllers/OrdersController";

const app = express();
app.use(express.json());



app.use("/api/orders", ordersRouter);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Orders microservice running on http://localhost:${port}`);
});