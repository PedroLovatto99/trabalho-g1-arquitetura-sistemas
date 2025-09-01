import type { OrderEntity } from "../../Data/Db/Entities/Orders";

export interface FindManyParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface IOrderRepository {
  create(orderData: OrderEntity): Promise<OrderEntity>;
  findBySlug(slug: string): Promise<OrderEntity | null>;
  findMany(): Promise<OrderEntity[]>;
  update(slug: string, orderData: Partial<OrderEntity>): Promise<OrderEntity | null>;
  delete(slug: string): Promise<void>;
}
