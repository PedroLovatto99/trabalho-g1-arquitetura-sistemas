import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type {
  FindManyParams,
  IProductRepository,
} from "../Interfaces/IProductRepository";

type ProductPatch = Partial<Omit<ProductEntity, "generateSlug">>;
export class ProductRepositoryMemory implements IProductRepository {
  private table: ProductEntity[] = [];

  async create(p: ProductEntity): Promise<ProductEntity> {
    this.table.push(p);
    return p;
  }

  async findBySlug(slug: string) {
    const found = this.table.find((r) => r.slug === slug);
    return found ?? null;
  }

  async findMany(): Promise<ProductEntity[]> {
    return this.table;
  }

  async updateBySlug(
    slug: string,
    patch: Partial<ProductEntity>
  ): Promise<ProductEntity | null> {
    const entity = this.table.find((r) => r.slug === slug);
    if (!entity) return null;
    Object.assign(entity, patch);
    return entity;
  }

  async delete(slug: string) {
    const i = this.table.findIndex((r) => r.slug === slug);
    if (i === -1) return false;
    this.table.splice(i, 1);
    return true;
  }
}
