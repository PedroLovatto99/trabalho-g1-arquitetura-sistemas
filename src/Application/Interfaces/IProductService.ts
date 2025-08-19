import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { ProductDto } from "../Dtos/ProductDto";

export interface IProductService {
  create(dto: ProductDto): Promise<ListProductDto>;
//   list(): Promise<ProductEntity[]>;
//   get(id: string): Promise<ProductEntity | null>;
//   update(id: string, dto: Partial<ProductDto>): Promise<ProductEntity | null>;
//   remove(id: string): Promise<boolean>;
}
