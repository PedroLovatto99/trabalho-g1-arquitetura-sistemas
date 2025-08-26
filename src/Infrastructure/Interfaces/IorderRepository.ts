import type { OrderEntity } from "../../Data/Db/Entities/Orders";

export interface FindManyParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface IOrderRepository {
  create(p: OrderEntity): Promise<OrderEntity>;
  findBySlug(slug: string): Promise<OrderEntity | null>;
  findMany(): Promise<OrderEntity[]>;
  updateBySlug(
    slug: string,
    patch: Partial<OrderEntity>
  ): Promise<OrderEntity | null>;
  delete(slug: string): Promise<boolean>;
}
