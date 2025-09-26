import { productsApi } from './api'; 

// --- Tipos e Erro Customizado (manter como estavam) ---
export interface OrderItem {
  productId: string;
  quantity: number;
}
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}
export class StockValidationError extends Error {
  // ... (código do erro sem alterações)
  public unavailableProducts: Array<{ productId: string; requested: number; available: number }>;
  constructor(unavailableProducts: Array<{ productId: string; requested: number; available: number }>) {
    const productIds = unavailableProducts.map(p => p.productId).join(', ');
    super(`Estoque insuficiente para os produtos: ${productIds}`);
    this.name = 'StockValidationError';
    this.unavailableProducts = unavailableProducts;
  }
}
// -------------------------------------------------------------

export interface IProductApi {
  findManyByIds(ids: string[]): Promise<Product[]>;
  adjustStock(productId: string, quantity: number): Promise<void>;
  checkStockAvailability(items: OrderItem[]): Promise<void>;
}

export class ProductServiceHttpClient implements IProductApi {

  async checkStockAvailability(items: OrderItem[]): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }
    console.log('Verificando disponibilidade de estoque...');
    const productIds = items.map(item => item.productId);
  
    const productsFromDB = await this.findManyByIds(productIds);
    const productMap = new Map(productsFromDB.map(p => [p.id, p]));
    const unavailableProducts: Array<{ productId: string; requested: number; available: number }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stock < item.quantity) {
        unavailableProducts.push({
          productId: item.productId,
          requested: item.quantity,
          available: product ? product.stock : 0,
        });
      }
    }
    if (unavailableProducts.length > 0) {
      throw new StockValidationError(unavailableProducts);
    }
    console.log('Estoque disponível para todos os produtos.');
  }

  /**
   * CORRIGIDO: Busca múltiplos produtos fazendo uma chamada GET para cada ID em paralelo.
   */
  async findManyByIds(ids: string[]): Promise<Product[]> {
    console.log("🚀 ~ ProductServiceHttpClient ~ findManyByIds ~ ids:", ids)
    try {
      // 1. Cria um array de "promessas" de requisição, uma para cada ID.
      // Note que usamos apenas o caminho relativo, pois a baseURL já está no 'api.ts'
      const requests = ids.map(id => productsApi.get<Product>(`/${id}`));

      // 2. Executa todas as promessas em paralelo e espera todas terminarem.
      const responses = await Promise.all(requests);

      // 3. Extrai os dados (o corpo da resposta) de cada resposta.
      const products = responses.map(response => response.data);

      return products;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw new Error('Falha na comunicação com o serviço de produtos.');
    }
  }

  /**
   * CORRIGIDO: Ajusta o estoque usando a instância 'api' e o caminho relativo.
   */
  async adjustStock(productId: string, quantity: number): Promise<void> {
    try {
      // ✅ Usa a instância 'api' e apenas o caminho do endpoint.
      await productsApi.patch(`/api/products/${productId}/stock`, { quantity });
    } catch (error) {
      console.error(`Erro ao ajustar estoque do produto ${productId}:`, error);
      throw new Error(`Não foi possível atualizar o estoque do produto ${productId}.`);
    }
  }
}