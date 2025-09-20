import axios from 'axios';

// URL base do microserviço de produtos
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001/api/products';

export class ProductServiceHttpClient implements IProductRepository {
  async findManyByIds(ids: string[]): Promise<Product[]> {
    try {
      // O serviço de produtos precisa de uma rota que aceite múltiplos IDs
      // Ex: GET http://localhost:3001/api/products?ids=id1,id2,id3
      const response = await axios.get(`${PRODUCT_SERVICE_URL}`, {
        params: { ids: ids.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  }

  async adjustStock(productId: string, quantity: number): Promise<void> {
    try {
      // O serviço de produtos já tem essa rota
      // PATCH http://localhost:3001/api/products/:id/stock
      await axios.patch(`${PRODUCT_SERVICE_URL}/${productId}/stock`, { quantity });
    } catch (error) {
      console.error(`Erro ao ajustar estoque do produto ${productId}:`, error);
      throw new Error('Não foi possível atualizar o estoque do produto.');
    }
  }
}