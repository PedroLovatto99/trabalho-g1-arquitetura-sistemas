import express from "express";
import productRouter from "./Api/Controllers/productController";

const app = express();
app.use(express.json());

app.use("/api/products", productRouter);

const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`Products microservice running on http://localhost:${port}`);
});