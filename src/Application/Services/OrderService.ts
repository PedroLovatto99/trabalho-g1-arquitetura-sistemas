import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { IClientRepository } from "../../Infrastructure/Interfaces/IClientRepository";
import { FullOrder, IOrderRepository } from "../../Infrastructure/Interfaces/IorderRepository";
import { IProductRepository } from "../../Infrastructure/Interfaces/IProductRepository";
import {
  ConfirmPaymentDTO,
  CreateOrderDTO,
  OrderResponseDTO,
} from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";

export class OrderService implements IOrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private clientRepo: IClientRepository,
    private productRepo: IProductRepository
  ) {}
  findAll(): Promise<OrderResponseDTO[]> {
    throw new Error("Method not implemented.");
  }
  findbySlug(slug: string): Promise<OrderResponseDTO> {
    throw new Error("Method not implemented.");
  }

  async create(dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    const client = await this.clientRepo.findBySlug(dto.clientSlug);
    if (!client || client.isDeleted) throw new Error("Cliente não encontrado.");

    if (!dto.products?.length)
      throw new Error("O pedido precisa ter pelo menos um produto.");

    const productSlugs = dto.products.map((p) => p.productSlug);
    const productsInDb = await this.productRepo.findManyBySlugs(productSlugs);

    if (productsInDb.length !== productSlugs.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    for (const item of dto.products) {
      const product = productsInDb.find((p) => p.slug === item.productSlug);
      if (!product)
        throw new Error(`Produto ${item.productSlug} não encontrado.`);
      if (product.stock < item.quantity) {
        throw new Error(
          `Estoque insuficiente para ${product.name}. Pedido: ${item.quantity}, Estoque: ${product.stock}`
        );
      }
    }
    const order = new OrderEntity({
      clientId: client.id,
      products: dto.products.map((item) => {
        const p = productsInDb.find((x) => x.slug === item.productSlug)!;
        return new ProductsOnOrdersEntity({
          productId: p.id,
          quantity: item.quantity,
        });
      }),
    });

    const createdOrder = await this.orderRepo.create(order);

    return this.mapToResponseDTO(createdOrder);
  }

  async findOrdersByClient(clientId: string): Promise<OrderResponseDTO[]> {
    const orders = await this.orderRepo.findManyByClientId(clientId);
    return orders.map(this.mapToResponseDTO);
  }

  async confirmPayment(
    slug: string,
    dto: ConfirmPaymentDTO
  ): Promise<OrderResponseDTO> {
    const order = await this.orderRepo.findBySlug(slug);
    if (!order) throw new Error("Pedido não encontrado.");
    if (order.status.name !== "AGUARDANDO PAGAMENTO")
      throw new Error("Este pedido não pode mais ser pago.");

    const orderTotal = order.products.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    );
    const totalPaid = dto.payments.reduce((sum, p) => sum + p.total, 0);

    if (totalPaid < orderTotal) {
      await this.orderRepo.updateStatus(slug, 3);
      throw new Error(
        `Valor pago (R$${totalPaid.toFixed(
          2
        )}) é menor que o total do pedido (R$${orderTotal.toFixed(2)}).`
      );
    }

    const paymentSuccess = Math.random() > 0.2;

    if (paymentSuccess) {
      const updatedOrder = await this.orderRepo.confirmPayment(
        slug,
        dto.payments
      );
      return this.mapToResponseDTO(updatedOrder);
    } else {
      await this.orderRepo.cancelOrder(slug);
      throw new Error(
        "Simulação de falha no pagamento. O pedido foi cancelado e o estoque devolvido."
      );
    }
  }

  private mapToResponseDTO(order: FullOrder): OrderResponseDTO {
    return {
      id: order.id,
      slug: order.slug,
      createdAt: order.createdAt,
      status: { name: order.status.name },
      client: { id: order.client.id, name: order.client.name },
      products: order.products.map((p) => ({
        name: p.product.name,
        price: p.product.price,
        quantity: p.quantity,
      })),
      payments: order.payments.map((p) => ({
        total: p.total,
        type: p.typePayment.name,
      })),
    };
  }
}
