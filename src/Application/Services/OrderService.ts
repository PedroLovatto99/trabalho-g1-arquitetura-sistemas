import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { IOrderRepository } from "../../Infrastructure/Interfaces/IOrderRepository";
import { CreateOrderDTO, OrderResponseDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";

export class OrderService implements IOrderService {
  constructor(private repo: IOrderRepository) {}
  
  async create(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    if (!dto.client || dto.client.trim().length < 3)
      throw new Error("Nome do cliente precisa ter mais que 3 caracteres");

    if (!dto.products || dto.products.length === 0)
      throw new Error("O pedido precisa ter pelo menos um produto.");

    const order = new OrderEntity();
    order.client = dto.client;

    order.Products = dto.products.map((p) => {
      if (p.quantity < 1) {
        throw new Error("A quantidade do produto deve ser pelo menos 1.");
      }
      return new ProductsOnOrdersEntity({
        productId: p.productId,
        quantity: p.quantity,
        orderId: order.id,
      });
    });

    const createdOrder = await this.repo.create(order);

    return this.mapToResponseDTO(createdOrder);
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await this.repo.findMany();
    return orders.map((order) => this.mapToResponseDTO(order));
  }

  async findbySlug(slug: string): Promise<OrderResponseDTO | null> {
    const order = await this.repo.findBySlug(slug);
    if (!order) {
      return null;
    }
    return this.mapToResponseDTO(order);
  }

  // // É melhor deletar por ID único em vez de slug
  // async delete(id: string): Promise<void> {
  //   const current = await this.repo.findById(id);
  //   if (!current) {
  //     throw new Error("Pedido não encontrado");
  //   }
  //   await this.repo.delete(id);
  // }

  private mapToResponseDTO(order: OrderEntity): OrderResponseDTO {
    return {
      id: order.id,
      client: order.client,
      createdAt: order.createdAt,
      products: order.Products.map((item) => ({
        productId: item.productId,
        name: item.product!.Name,
        price: item.product!.Price,
        quantity: item.quantity,
      })),
    };
  }
}
