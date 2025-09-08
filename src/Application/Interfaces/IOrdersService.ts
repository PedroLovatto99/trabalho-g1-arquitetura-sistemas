import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { ConfirmPaymentDTO, CreateOrderDTO, OrderResponseDTO,  } from "../Dtos/OrdersDto";

export interface IOrderService {
  create(dto: CreateOrderDTO): Promise<OrderResponseDTO>;
  findAll(): Promise<OrderResponseDTO[]>;
  findbySlug(slug: string): Promise<OrderResponseDTO>;
  findOrdersByClient(clientId: string): Promise<OrderResponseDTO[]>;
  confirmPayment(slug: string, dto: ConfirmPaymentDTO): Promise<OrderResponseDTO>;
}
