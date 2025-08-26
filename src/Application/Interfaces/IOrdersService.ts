import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { ListProductDto } from "../Dtos/ListProductDto";
import type { OrderDTO } from "../Dtos/OrdersDto";

export interface IOrderService {
  create(dto: OrderDTO): Promise<OrderDTO>;
  findAll(): Promise<OrderDTO[]>;
  findbySlug(slug: string): Promise<OrderDTO>;
}
