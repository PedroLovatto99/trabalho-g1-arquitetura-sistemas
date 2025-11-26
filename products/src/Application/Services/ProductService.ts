import { ProductDto } from "../Dtos/ProductDto"; // Usaremos um DTO mais simples
import { IProductRepository } from "../../Infrastructure/Interfaces/IProductRepository";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { IProductService } from "../Interfaces/IProductService";
import redisClient from "../../redis/redits";
export class ProductService implements IProductService {
  constructor(private readonly repo: IProductRepository) {}

  private async invalidateProductsCache() {
    const cacheKey = 'products:all';
    await redisClient.del(cacheKey);
    console.log(`[Cache] Invalidado: ${cacheKey}`);
  }

  async create(dto: ProductDto): Promise<ProductEntity> {
    // Validações de negócio
    if (!dto.name || dto.name.trim().length < 3)
      throw new Error("Nome precisa ter mais que 3 caracteres");
    if (dto.price < 0) throw new Error("Preço não pode ser negativo");
    if (dto.stock < 0) throw new Error("Estoque não pode ser negativo");

    // Passa o DTO diretamente para o repositório
    return this.repo.create(dto);
  }

  async findAll(): Promise<ProductEntity[]> {
    const cacheKey = 'products:all';

    // 2. Tenta buscar do cache primeiro
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return JSON.parse(cachedProducts);
    }

    // 3. Se não encontrar, busca no banco
    console.log(`[Cache] MISS: ${cacheKey}`);
    const products = await this.repo.findMany();

    // Salva no cache com TTL de 4 horas (14400 segundos) antes de retornar
    await redisClient.set(cacheKey, JSON.stringify(products), { EX: 14400 });

    return products;
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new Error("Nenhum produto encontrado");
    }
    return product;
  }


  async update(id: string, dto: Partial<ProductDto>): Promise<ProductEntity | null> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new Error("Produto não encontrado para atualizar");
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    // Verifica se o produto existe antes de tentar deletar
    const current = await this.repo.findById(id);
    if (!current) {
      throw new Error("Produto não encontrado para deletar");
    }
    return this.repo.delete(id);
  }

  async findAvailable(): Promise<ProductDto[]> {
    return this.repo.findAvailable();
  }

  async adjustStock(id: string, quantity: number): Promise<ProductEntity | null> {
    const product = await this.repo.findById(id);

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error("Estoque insuficiente");
    }

    return this.repo.update(id, { stock: newStock });
  }
}