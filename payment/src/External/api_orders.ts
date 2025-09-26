import { ordersApi } from "./api";

interface ProductItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Representa a estrutura completa de um pedido retornado pela API
interface Order {
  id: string;
  clientId: string;
  total: number;
  status: string; // Ex: 'PENDING', 'CONFIRMED', 'CANCELED'
  products: ProductItem[];
  createdAt: string; // Geralmente vem como string ISO (ex: '2025-09-25T23:40:58.123Z')
  updatedAt: string;
}

export class OrderServiceHttpClient {
  /**
   * Busca os detalhes completos de um pedido pelo seu ID.
   * Corresponde a: GET /api/orders/:id
   * @param orderId O ID do pedido a ser buscado.
   * @returns O objeto do pedido ou null se não for encontrado.
   */
  async findById(orderId: string): Promise<Order | null> {
    try {
      console.log(`Buscando pedido na API de Pedidos: ${orderId}`);
      const response = await ordersApi.get<Order>(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      // Verifica se o erro é uma resposta 404 (Não Encontrado)
      if (error.response && error.response.status === 404) {
        console.warn(`Pedido ${orderId} não encontrado na API de Pedidos.`);
        return null;
      }
      // Para outros erros (ex: 500, falha de rede), lança uma exceção
      console.error(`Erro ao buscar pedido ${orderId}:`, error);
      throw new Error("Falha na comunicação com o serviço de pedidos.");
    }
  }

  /**
   * Atualiza o status de um pedido específico.
   * Corresponde a: PATCH /api/orders/:id/status
   * @param orderId O ID do pedido a ser atualizado.
   * @param status O novo status para o pedido.
   * @returns O objeto do pedido com o status atualizado.
   */
  async updateStatus(orderId: string, status: string): Promise<Order> {
    try {
      console.log(`Atualizando status do pedido ${orderId} para ${status}...`);
      const response = await ordersApi.patch<Order>(`/api/orders/${orderId}/status`, {
        status, // O novo status é enviado no corpo da requisição
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do pedido ${orderId}:`, error);
      throw new Error(
        `Não foi possível atualizar o status do pedido ${orderId}.`
      );
    }
  }
}
