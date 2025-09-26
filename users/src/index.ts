import express from "express";
import clientRouter from "./Api/Controllers/ClientController";
import 'dotenv/config'

const app = express();
app.use(express.json());

app.use("/api/clients", clientRouter);

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Clients microservice running on http://localhost:${port}`);
});