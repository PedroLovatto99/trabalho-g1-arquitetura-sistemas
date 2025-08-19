import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type {
  FindManyParams,
  IProductRepository,
} from "../Interfaces/IProductRepository";

export class ProductRepositoryMemory implements IProductRepository {

  private table: ProductEntity[] = [];

  async create(p: ProductEntity): Promise<ProductEntity> {
    this.table.push(p);
    return p;
  }

  // async findById(id: string) {
  //   const found = this.table.find((r) => r.id === id);
  //   return found ? { ...found } : null;
  // }

  // async findMany({ offset = 0, limit = 50, search }: FindManyParams = {}) {
  //   let data = this.table;
  //   if (search) {
  //     const q = search.toLowerCase();
  //     data = data.filter((r) => r.Name.toLowerCase().includes(q));
  //   }
  //   return data.slice(offset, offset + limit).map((r) => ({ ...r }));
  // }

  // async update(id: string, patch: Partial<ProductEntity>) {
  //   const i = this.table.findIndex((r) => r.id === id);
  //   if (i === -1) return null;
  //   this.table[i] = { ...this.table[i], ...patch };
  //   return { ...this.table[i] };
  // }

  async delete(id: string) {
    const i = this.table.findIndex((r) => r.id === id);
    if (i === -1) return false;
    this.table.splice(i, 1);
    return true;
  }
}
