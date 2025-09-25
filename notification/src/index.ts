import express from "express";
import notificationRouter from "./Api/Controllers/NotificationController";

const app = express();
app.use(express.json());

app.use("/api/notification", notificationRouter);

const port = 3007; 
app.listen(port, () => {
  console.log(`Products microservice running on http://localhost:${port}`);
});