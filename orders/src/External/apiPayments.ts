// src/services/PaymentServiceHttpClient.ts

import { paymentsApi } from './api'; // Importando a instância do Axios para o serviço de pagamentos

// --- Definição de Tipos ---

// O DTO que a função recebe para criar um pagamento
export type CreatePaymentDTO = {
  orderId: string;
  typePaymentId: string; // Ex: 'CREDIT_CARD', 'PIX'
  amountPaid: number;
};

// A estrutura de um pagamento que a API retorna após a criação
export interface Payment {
  id: string;
  orderId: string;
  typePaymentId: string;
  amountPaid: number;
  status: string; // Ex: 'PENDING'
  paidAt: string | null;
  createdAt: string;
}

export interface IPaymentApi {
  createPayment(paymentData: CreatePaymentDTO): Promise<Payment>;
  // Você pode adicionar outros métodos aqui conforme necessário
}

export class PaymentServiceHttpClient implements IPaymentApi {
  /**
   * Cria um novo registro de pagamento no serviço de pagamentos.
   * Corresponde a: POST /api/payments
   * @param paymentData - As informações do pagamento a ser criado.
   * @returns O objeto do pagamento recém-criado.
   */
  async createPayment(paymentData: CreatePaymentDTO): Promise<Payment> {
    console.log('Enviando requisição para criar pagamento...', paymentData);

    try {
      // Faz a requisição POST para o endpoint de criação de pagamentos
      // O objeto 'paymentData' é enviado como corpo (body) da requisição
      const response = await paymentsApi.post<Payment>('', paymentData);

      // Retorna os dados do pagamento criado que a API retornou
      return response.data;
    } catch (error) {
      console.error("Erro ao criar pagamento:", error || error);
      throw new Error("Falha na comunicação com o serviço de pagamentos.");
    }
  }

  // Você pode adicionar outros métodos aqui para interagir com a API de pagamentos
  // Ex: findById, processPayment, etc.
}