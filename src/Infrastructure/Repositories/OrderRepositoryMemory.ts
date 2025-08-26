import type { OrderEntity } from "../../Data/Db/Entities/Orders";
import type {
  FindManyParams,
  IOrderRepository,
} from "../Interfaces/IorderRepository";

type OrderPatch = Partial<Omit<OrderEntity, "generateSlug">>;

export class OrderRepositoryMemory implements IOrderRepository {
  private table: OrderEntity[] = [];

  async create(order: OrderEntity): Promise<OrderEntity> {
    this.table.push(order);
    return order;
  }

  async findBySlug(slug: string): Promise<OrderEntity | null> {
    const found = this.table.find((r) => r.slug === slug);
    return found ?? null;
  }

  async findMany(): Promise<OrderEntity[]> {
    return this.table;
  }

  async updateBySlug(
    slug: string,
    patch: Partial<OrderEntity>
  ): Promise<OrderEntity | null> {
    const entity = this.table.find((r) => r.slug === slug);
    if (!entity) return null;
    Object.assign(entity, patch);
    return entity;
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    const i = this.table.findIndex((r) => r.slug === slug);
    if (i === -1) return false;
    this.table.splice(i, 1);
    return true;
  }

  async delete(slug: string): Promise<boolean> {
    return this.deleteBySlug(slug);
  }


}