import { ProductEntity } from "../../Data/Db/Entities/Product";
import { ProductDto } from "../../Application/Dtos/ProductDto";

export interface IProductRepository {
  create(data: ProductDto): Promise<ProductEntity>;
  findMany(): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  update(id: string, data: Partial<ProductDto>): Promise<ProductEntity | null>;
  delete(id: string): Promise<boolean>;
  findManyByIds(ids: string[]): Promise<ProductEntity[]>;
}