import { prisma } from "../../Data/Db/Configurations/prisma";
import { CreateOrderDTO, PaymentDTO } from "../../Application/Dtos/OrdersDto";
import { FullOrder, IOrderRepository } from "../Interfaces/IorderRepository";
import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { StatusPayment } from "../../Data/Db/Enums/StatusPayment";
import crypto from "node:crypto";
export class OrderRepository implements IOrderRepository {
  private readonly fullOrderInclude = {
    client: true,
    status: true,
    products: { include: { product: true } },
    payments: { include: { typePayment: true } },
  };

  async create(order: OrderEntity): Promise<FullOrder> {
    // Se estiver em Postgres, vale a pena forçar SERIALIZABLE pra evitar corrida entre transações:
    return prisma.$transaction(
      async (tx) => {
        // 1) Debitar estoque com checagem atômica (não deixa ir abaixo de zero)
        for (const p of order.products) {
          const res = await tx.product.updateMany({
            where: {
              id: p.productId,
              stock: { gte: p.quantity }, // garante estoque suficiente
            },
            data: { stock: { decrement: p.quantity } },
          });

          if (res.count === 0) {
            // nada foi atualizado => sem estoque suficiente ou produto inexistente
            throw new Error(
              `Estoque insuficiente para o produto ${p.productId}.`
            );
          }
        }

        // 2) Criar o pedido com itens (use createMany no nested pra performance)
        return tx.order.create({
          data: {
            slug: order.slug,
            clientId: order.clientId,

            // ====== COMO DEFINIR O STATUS ======
            // a) Se for um enum no próprio model Order (ex.: status PaymentStatus):
            // status: 'AGUARDANDO_PAGAMENTO',

            // b) Se for uma FK para uma tabela Status (relacionamento):
            // status: { connect: { id: StatusPayment.AGUARDANDO_PAGAMENTO } },

            // c) Se for uma coluna numérica "statusId" simples:
            statusId: StatusPayment.AGUARDANDO_PAGAMENTO,
            // ====================================

            products: {
              createMany: {
                data: order.products.map((p) => ({
                  quantity: p.quantity,
                  productId: p.productId,
                  slug: order.slug, // <- campo que referencia Order (conforme seu schema)
                })),
                skipDuplicates: true,
              },
            },
          },
          include: this.fullOrderInclude,
        });
      },
      // nível de isolamento (opcional, suportado em Postgres e SQL Server)
      { isolationLevel: "Serializable" }
    );
  }

  async findBySlug(slug: string): Promise<FullOrder | null> {
    return prisma.order.findUnique({
      where: { slug },
      include: this.fullOrderInclude,
    });
  }

  async findManyByClientId(clientId: string): Promise<FullOrder[]> {
    return prisma.order.findMany({
      where: { clientId },
      include: this.fullOrderInclude,
    });
  }

  async updateStatus(slug: string, statusId: number): Promise<FullOrder> {
    return prisma.order.update({
      where: { slug },
      data: { statusId },
      include: this.fullOrderInclude,
    });
  }

  async cancelOrder(slug: string): Promise<FullOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { slug },
        include: { products: true },
      });
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
        include: this.fullOrderInclude,
      });
    });
  }

  async confirmPayment(
    slug: string,
    payments: PaymentDTO[]
  ): Promise<FullOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { slug },
        data: { statusId: 2 },
      });

      await tx.orderPayment.createMany({
        data: payments.map((p) => ({
          slug : crypto.randomBytes(10).toString("hex"),
          total: p.total,
          typePaymentId: p.typePaymentId,
          orderId: order.id,
        })),
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: this.fullOrderInclude,
      });
    });
  }
}