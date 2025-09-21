import express from "express";
import paymentsRouter from "./Api/Controllers/PaymentController";

const app = express();
app.use(express.json());

app.use("/api/payments", paymentsRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
