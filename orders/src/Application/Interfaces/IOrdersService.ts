import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { ConfirmPaymentDTO, CreateOrderDTO, OrderResponseDTO, OrderDTO } from "../Dtos/OrdersDto";

export interface IOrderService {
  create(dto: OrderDTO): Promise<OrderDTO>;
  findAll(): Promise<OrderDTO[]>;
  findbySlug(slug: string): Promise<OrderDTO>;
  findOrdersByClient(clientId: string): Promise<OrderResponseDTO[]>;
  confirmPayment(slug: string, dto: ConfirmPaymentDTO): Promise<OrderResponseDTO>;
}
