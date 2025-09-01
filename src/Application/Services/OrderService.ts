import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { CreateOrderDTO, OrderResponseDTO, UpdateOrderDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { IOrderRepository } from "../../Infrastructure/Interfaces/IorderRepository";

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
        throw new Error(
          `A quantidade do produto ${p.productSlug} deve ser pelo menos 1.`
        );
      }
      return new ProductsOnOrdersEntity({
        productId: p.productSlug,
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
    console.log("🚀 ~ OrderService ~ findbySlug ~ order:", order);
    if (!order) {
      throw new Error(`Ordem de pedido não encontrado!`);
    }
    return this.mapToResponseDTO(order);
  }

  async update(slug: string, dto: UpdateOrderDTO): Promise<OrderResponseDTO> {
    // Validação básica dos dados de entrada
    if (dto.client && dto.client.trim().length < 3) {
      throw new Error("Nome do cliente precisa ter mais que 3 caracteres");
    }

    const orderToUpdate = new OrderEntity();
    orderToUpdate.client = dto.client;
    console.log("🚀 ~ OrderService ~ update ~ dto:", dto)

    const updatedOrder = await this.repo.update(slug, dto);
    console.log("🚀 ~ OrderService ~ update ~ updatedOrder:", updatedOrder)

    if (!updatedOrder) {
      throw new Error("Pedido não encontrado ou falha ao atualizar.");
    }

    return this.mapToResponseDTO(updatedOrder);
  }

  async delete(slug: string): Promise<void> {
    const success = await this.repo.delete(slug);

    if (!success) {
      throw new Error("Pedido não encontrado ou falha ao deletar.");
    }
  }

  private mapToResponseDTO(order: OrderEntity): OrderResponseDTO {
    return {
      id: order.id,
      client: order.client,
      createdAt: order.createdAt,
      slug: order.slug,
      products: order.Products.map((item) => ({
        slug: item.product!.slug,
        productId: item.productId,
        name: item.product!.name,
        price: item.product!.price,
        quantity: item.quantity,
      })),
    };
  }
}
