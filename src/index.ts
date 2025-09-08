import express from "express";
import productRouter from "./Api/Controllers/productController";
import orderRouter from "./Api/Controllers/OrdersController"
import clientRouter from "./Api/Controllers/ClientController";

const app = express();
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/clients", clientRouter);
app.use("/api/orders", orderRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
