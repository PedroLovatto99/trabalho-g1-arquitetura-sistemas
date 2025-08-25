import type { ProductEntity } from "../../Data/Db/Entities/Product";

export interface FindManyParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface IProductRepository {
  create(p: ProductEntity): Promise<ProductEntity>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findMany(): Promise<ProductEntity[]>;
  updateBySlug(
    slug: string,
    patch: Partial<ProductEntity>
  ): Promise<ProductEntity | null>;
  delete(slug: string): Promise<boolean>;
}
