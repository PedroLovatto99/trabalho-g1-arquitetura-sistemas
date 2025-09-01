import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { ProductDto } from "../Dtos/ProductDto";

export interface IProductService {
  create(dto: ProductDto): Promise<ListProductDto>;
  findAll(): Promise<ListProductDto[]>;
  findbySlug(slug: string): Promise<ListProductDto>;
  delete(slug: string): Promise<boolean>;
}
