import express from "express";
import productRouter from "./Api/Controllers/productController";
import orderRouter from "./Api/Controllers/OrdersController"

const app = express();
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
