import { ProductEntity } from "../../Data/Db/Entities/Product";
import type { IProductRepository } from "../../Infrastructure/Interfaces/IProductRepository";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { ProductDto } from "../Dtos/ProductDto";
import type { IProductService } from "../Interfaces/IProductService";

export class ProductService implements IProductService {
  constructor(private repo: IProductRepository) {}

  async create(dto: ProductDto): Promise<ListProductDto> {
    if (!dto.name || dto.name.trim().length < 3)
      throw new Error("Nome precisa ter mais que  3 caracteres");

    if (dto.price < 0) throw new Error("Preço  não pode ser negativo");
    if (dto.stock < 0) throw new Error("Estoque não pode ser negativo");

    const product = new ProductEntity();
    product.Name = dto.name;
    product.Price = dto.price;
    product.Stock = dto.stock;

    const products = await this.repo.create(product);

    const returnDto: ListProductDto = {
      slug: products.slug,
      name: products.Name,
      price: products.Price,
      stock: products.Stock,
    };

    return returnDto;
  }

  async findAll(): Promise<ListProductDto[]> {
    const products = await this.repo.findMany();

    if (!products || products.length === 0) {
      return [];
    }

    return products.map((p) => ({
      slug: p.slug,
      name: p.Name,
      price: p.Price,
      stock: p.Stock,
    }));
  }

  async findbySlug(slug: string): Promise<ListProductDto> {
    const products = await this.repo.findBySlug(slug);

    if (!products) {
      throw new Error("Nenhum produto encontrado");
    }

    return {
      slug: products.slug,
      name: products.Name,
      price: products.Price,
      stock: products.Stock,
    };
  }

  async update(
    slug: string,
    dto: Partial<ProductDto>
  ): Promise<ListProductDto> {
    const patch: Partial<ProductEntity> = {};
    if (dto.name !== undefined) patch.Name = dto.name;
    if (dto.price !== undefined) patch.Price = dto.price;
    if (dto.stock !== undefined) patch.Stock = dto.stock;

    const updated = await this.repo.updateBySlug(slug, patch);
    if (!updated) throw new Error("Produto não encontrado");

    return {
      slug: updated.slug,
      name: updated.Name,
      price: updated.Price,
      stock: updated.Stock,
    };
  }

  async delete(slug: string): Promise<void> {
    const current = await this.repo.findBySlug(slug);
    if (!current) throw new Error("Produto não encontrado");

    await this.repo.delete(current.Name);
  }
}
