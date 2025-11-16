import axios from 'axios';

// A URL base para o serviço de usuários.
const USER_API_URL = process.env.USER_API_URL || 'http://localhost:3001/api/clients';

const usersApiInstance = axios.create({
  baseURL: USER_API_URL,
});

// Define a estrutura de um usuário que esperamos receber
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

// Interface para a nossa API de usuários
export interface IUserApi {
  getUser(id: string): Promise<UserEntity | null>;
}

// Implementação da classe que busca o usuário
export class UserApi implements IUserApi {
  async getUser(id: string): Promise<UserEntity | null> {
    try {
      const response = await usersApiInstance.get<UserEntity>(`/${id}`);
      return response.data;
    } catch (error) {
      // Acessa a mensagem de forma segura
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(`Erro ao buscar usuário com id ${id}:`, msg);
      return null;
    }
  }
}