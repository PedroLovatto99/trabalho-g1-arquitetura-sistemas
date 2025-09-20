import { prisma } from "../../Data/Db/Configurations/prisma";
import { OrderStatus, ProductItem } from "@prisma/client";
import { CreateOrderDTO } from "../../Application/Dtos/OrdersDto";
import { FullOrder, IOrderRepository } from "../Interfaces/IorderRepository";

export class OrderRepository implements IOrderRepository {
  async create(dto: CreateOrderDTO, total: number, productItems: ProductItem[]): Promise<FullOrder> {
    const newOrder = await prisma.order.create({
      data: {
        clientId: dto.clientId,
        total: total,
        status: 'AWAITING_PAYMENT',
        products: productItems, // Insere o array de produtos diretamente
      },
    });
    return newOrder;
  }

  async findById(id: string): Promise<FullOrder | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  async findByClientId(clientId: string): Promise<FullOrder[]> {
    return prisma.order.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<FullOrder | null> {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}