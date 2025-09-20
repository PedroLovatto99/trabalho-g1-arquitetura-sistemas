import { Order, OrderStatus, ProductItem } from "@prisma/client";
import { CreateOrderDTO } from "../../Application/Dtos/OrdersDto";

// O tipo 'Order' gerado pelo Prisma já contém o array de produtos
export type FullOrder = Order;

export interface IOrderRepository {
  create(dto: CreateOrderDTO, total: number, productItems: ProductItem[]): Promise<FullOrder>;
  findById(id: string): Promise<FullOrder | null>;
  findByClientId(clientId: string): Promise<FullOrder[]>;
  updateStatus(id: string, status: OrderStatus): Promise<FullOrder | null>;
}