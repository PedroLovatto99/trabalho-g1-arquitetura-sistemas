import { ProductEntity } from "../../Data/Db/Entities/Product";
import { ProductDto } from "../Dtos/ProductDto";

export interface IProductService {
  create(dto: ProductDto): Promise<ProductEntity>;

  findAll(): Promise<ProductEntity[]>;

  findById(id: string): Promise<ProductEntity | null>;

  update(id: string, dto: Partial<ProductDto>): Promise<ProductEntity | null>;

  delete(id: string): Promise<boolean>;

  adjustStock(id: string, quantity: number): Promise<ProductEntity | null>;
}