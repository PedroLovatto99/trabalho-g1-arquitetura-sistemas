// src/services/PaymentServiceHttpClient.ts

import { ordersApi } from "./api"; // Importando a instância do Axios para o serviço de pagamentos

// --- Definição de Tipos ---

// O DTO que a função recebe para criar um pagamento
export type CreatePaymentDTO = {
  orderId: string;
  typePaymentId: string; // Ex: 'CREDIT_CARD', 'PIX'
  amountPaid: number;
};

export interface UpdateOrderStatusDTO {
  status: string;
}

// A estrutura de um pagamento que a API retorna após a criação
export interface OrderDto {
  _id: string;
  clientId: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  paymentId: string;
}

export interface IOrderApi {
  getOrder(orderId: string): Promise<OrderDto>;
  updateStatus(orderId: string,status: UpdateOrderStatusDTO ): Promise<void>;
}

export class OrdersServiceHttpClient implements IOrderApi {
  /**
   * Cria um novo registro de pagamento no serviço de pagamentos.
   * Corresponde a: POST /api/payments
   * @param paymentData - As informações do pagamento a ser criado.
   * @returns O objeto do pagamento recém-criado.
   */
  async getOrder(orderId: string): Promise<OrderDto> {
    console.log("Enviando requisição para criar pagamento...", orderId);

    try {
      // Faz a requisição POST para o endpoint de criação de pagamentos
      // O objeto 'paymentData' é enviado como corpo (body) da requisição
      const response = await ordersApi.get<OrderDto>(`/${orderId}`);

      // Retorna os dados do pagamento criado que a API retornou
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pedido:", error || error);
      throw new Error("Falha na comunicação com o serviço de pedidos.");
    }
  }

  async updateStatus(orderId: string, status : UpdateOrderStatusDTO): Promise<void> {
    console.log("Enviando requisição para criar pagamento...", orderId);

    try {
      // Faz a requisição POST para o endpoint de criação de pagamentos
      // O objeto 'paymentData' é enviado como corpo (body) da requisição
      const response = await ordersApi.patch(`/${orderId}/status`, status);

      // Retorna os dados do pagamento criado que a API retornou
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pedido:", error || error);
      throw new Error("Falha na comunicação com o serviço de pedidos.");
    }
  }

  // Você pode adicionar outros métodos aqui para interagir com a API de pagamentos
  // Ex: findById, processPayment, etc.
}
