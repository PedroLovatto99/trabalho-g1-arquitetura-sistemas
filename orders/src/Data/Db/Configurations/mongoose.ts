import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("ERRO: A variável de ambiente 'DATABASE_URL' não está definida.");
  process.exit(1); // Encerra a aplicação se a URL do banco não for encontrada
}

const connectDB = async () => {
  try {
    // Tenta conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    
    // Log de sucesso claro que você verá ao iniciar o contêiner
    console.log('[DB] Conectado ao MongoDB com sucesso!');

  } catch (error) {
    // Log de erro claro que mostrará o problema exato da conexão
    console.error('[DB] Falha ao conectar ao MongoDB:', error);
    
    // Encerra a aplicação se a conexão inicial falhar. Isso é importante para ambientes Docker.
    process.exit(1); 
  }
};

// Evento para notificar se a conexão for perdida após a conexão inicial
mongoose.connection.on('disconnected', () => {
  console.log('[DB] Conexão com o MongoDB perdida.');
});

// Inicia a conexão assim que o arquivo é carregado
connectDB();

export default mongoose;