import express from "express"; // Importe a função
import ordersRouter from "./Api/Controllers/OrdersController";
import "dotenv/config"
import connectDB from "./Data/Db/Configurations/mongoose";

const app = express();
app.use(express.json());

app.use("/api/orders", ordersRouter);
const port = process.env.PORT || 3003;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Servidor rodando na porta ${port}`);
    });
});
