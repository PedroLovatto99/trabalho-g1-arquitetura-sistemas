// src/Data/Db/Configurations/mongoose.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.DATABASE_URL;
        if (!mongoUri) {
            throw new Error("DATABASE_URL não definida no arquivo .env");
        }

        await mongoose.connect(mongoUri);
        console.log("✅ Conectado ao MongoDB com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao conectar com o MongoDB:", error);
        process.exit(1); // Encerra a aplicação se a conexão falhar
    }
};

export default connectDB;