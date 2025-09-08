//import type { OrderEntity } from "../../Data/Db/Entities/Orders";
import type { Order, Client, Status, Product, OrderPayment, TypePayment } from "@prisma/client";
import { CreateOrderDTO, PaymentDTO } from "../../Application/Dtos/OrdersDto";
import { OrderEntity } from "../../Data/Db/Entities/Orders";

export type FullOrder = Order & {
  client: Client;
  status: Status;
  products: {
    quantity: number;
    product: Product;
  }[];
  payments: (OrderPayment & { typePayment: TypePayment })[];
};

export interface IOrderRepository {
  create(dto: OrderEntity): Promise<FullOrder>;
  findBySlug(slug: string): Promise<FullOrder | null>;
  findManyByClientId(clientId: string): Promise<FullOrder[]>;
  updateStatus(slug: string, statusId: number): Promise<FullOrder>;
  cancelOrder(slug: string): Promise<FullOrder>;
  confirmPayment(slug: string, payments: PaymentDTO[]): Promise<FullOrder>;
}
