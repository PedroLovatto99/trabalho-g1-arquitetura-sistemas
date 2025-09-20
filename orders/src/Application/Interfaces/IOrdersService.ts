import { FullOrder } from "../../Infrastructure/Interfaces/IorderRepository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../Dtos/OrdersDto";

export interface IOrderService {
  create(dto: CreateOrderDTO): Promise<FullOrder>;
  findById(id: string): Promise<FullOrder | null>;
  findByClient(clientId: string): Promise<FullOrder[]>;
  updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<FullOrder>;
}