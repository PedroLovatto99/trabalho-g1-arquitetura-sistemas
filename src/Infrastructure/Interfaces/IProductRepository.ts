import type { ProductEntity } from "../../Data/Db/Entities/Product";

export interface FindManyParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface IProductRepository {
  create(p: ProductEntity): Promise<ProductEntity>;
//   findById(id: string): Promise<ProductEntity | null>;
//   findMany(params?: FindManyParams): Promise<ProductEntity[]>;
//   update(
//     id: string,
//     patch: Partial<ProductEntity>
//   ): Promise<ProductEntity | null>;
  delete(id: string): Promise<boolean>;
}
