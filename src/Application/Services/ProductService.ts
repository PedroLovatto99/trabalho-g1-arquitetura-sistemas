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
}
