import express from "express";
import productRouter from "./Api/Controllers/productController";
//import 'dotenv/config';

const app = express();
app.use(express.json());

app.use("/api/products", productRouter);

const port = process.env.PORT || 3004; 
app.listen(port, () => {
  console.log(`Products microservice running on http://localhost:${port}`);
});