import express from 'express';
import './consumidor/consumidor'; 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Notification service is running and consumer is listening for messages.' });
});

app.listen(port, () => {
    console.log(`Notification service listening at http://localhost:${port}`);
});