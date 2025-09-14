import { prisma } from "../../Data/Db/Configurations/prisma";
import { CreateOrderDTO, PaymentDTO } from "../../Application/Dtos/OrdersDto";
import { FullOrder, IOrderRepository } from "../Interfaces/IOrderRepository";
import { nanoid } from "nanoid";

export class OrderRepository implements IOrderRepository {
  private readonly fullOrderInclude = {
    client: true,
    status: true,
    products: { include: { product: true } },
    payments: { include: { typePayment: true } },
  };

  async create(dto: CreateOrderDTO): Promise<FullOrder> {
    return prisma.$transaction(async (tx) => {
      for (const p of dto.products) {
        await tx.product.update({
          where: { id: p.productId },
          data: { stock: { decrement: p.quantity } },
        });
      }
      return tx.order.create({
        data: {
          slug: nanoid(12),
          clientId: dto.clientId,
          statusId: 1, // 1: AGUARDANDO PAGAMENTO
          products: {
            create: dto.products.map((p) => ({
              quantity: p.quantity,
              productId: p.productId,
            })),
          },
        },
        include: this.fullOrderInclude,
      });
    });
  }

  async findBySlug(slug: string): Promise<FullOrder | null> {
    return prisma.order.findUnique({ where: { slug }, include: this.fullOrderInclude });
  }

  async findManyByClientId(clientId: string): Promise<FullOrder[]> {
    return prisma.order.findMany({ where: { clientId }, include: this.fullOrderInclude });
  }

  async updateStatus(slug: string, statusId: number): Promise<FullOrder> {
    return prisma.order.update({
        where: { slug },
        data: { statusId },
        include: this.fullOrderInclude
    });
  }

  async cancelOrder(slug: string): Promise<FullOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { slug }, include: { products: true } });
      if (!order) throw new Error("Pedido não encontrado para cancelamento.");

      for (const item of order.products) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { slug },
        data: { statusId: 4 }, // 4: CANCELADO
        include: this.fullOrderInclude
      });
    });
  }

  async confirmPayment(slug: string, payments: PaymentDTO[]): Promise<FullOrder> {
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
            where: { slug },
            data: { statusId: 2 }, // 2: PAGO
        });

        await tx.orderPayment.createMany({
            data: payments.map(p => ({
                total: p.total,
                typePaymentId: p.typePaymentId,
                orderId: order.id
            }))
        });

        return tx.order.findUniqueOrThrow({
            where: { id: order.id },
            include: this.fullOrderInclude
        });
    });
  }
}