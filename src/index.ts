import express from "express";
import productRouter from "./Api/Controllers/productController";

const app = express();
app.use(express.json());

// Aqui você passa o router exportado do controller
app.use("/api", productRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
