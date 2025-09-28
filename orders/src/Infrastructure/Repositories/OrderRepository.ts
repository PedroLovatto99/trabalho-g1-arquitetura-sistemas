// src/Infrastructure/Repositories/OrderRepository.ts

import { OrderStatus } from "@prisma/client";
import { CreateOrderDTO } from "../../Application/Dtos/OrdersDto";
import { FullOrder, IOrderRepository } from "../Interfaces/IorderRepository";
import OrderModel, { IProductItem } from "../../Data/Db/Entities/OrderEntity"; // Importe o model

// NOTA: Seu tipo 'FullOrder' provavelmente será o mesmo que 'IOrder' do Mongoose.
// Você pode ajustar a interface IOrderRepository para usar IOrder diretamente.

export class OrderRepository implements IOrderRepository {
  async create(dto: CreateOrderDTO, total: number, productItems: IProductItem[]): Promise<FullOrder> {
    // Mongoose.create retorna o documento criado
    const newOrder = await OrderModel.create({
      clientId: dto.clientId,
      total: total,
      status: 'AWAITING_PAYMENT',
      products: productItems,
    });
    //@ts-ignore
      return newOrder.toObject(); ; // .toObject() converte o documento Mongoose para um objeto JS puro
  }

  async findById(id: string): Promise<FullOrder | null> {
    //@ts-ignore
    return OrderModel.findById(id).lean(); // .lean() retorna um objeto JS puro, mais rápido
  }

  async findByClientId(clientId: string): Promise<FullOrder[]> {
    //@ts-ignore
    return OrderModel.find({ clientId })
      .sort({ createdAt: -1 }) 
      .lean();
  }

  async updateStatus(id: string, status: OrderStatus): Promise<FullOrder | null> {
    //@ts-ignore
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }
}