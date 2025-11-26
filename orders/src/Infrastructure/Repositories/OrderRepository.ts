import { OrderStatus } from "@prisma/client";
import { CreateOrderDTO } from "../../Application/Dtos/OrdersDto";
import { FullOrder, IOrderRepository } from "../Interfaces/IorderRepository";
import OrderModel, { IProductItem } from "../../Data/Db/Entities/OrderEntity";

// Define um tipo para os dados de criação para manter o código limpo.
// A interface IorderRepository.ts também deve ser atualizada para usar este tipo.
type CreateOrderData = {
  clientId: string;
  total: number;
  products: IProductItem[];
  status: string | OrderStatus;
};

export class OrderRepository implements IOrderRepository {
  // CORRIGIDO: O método agora aceita um único objeto 'data'
  async create(data: CreateOrderData): Promise<FullOrder> {
    const { clientId, total, products, status } = data; // Desestruturamos o objeto aqui

    const newOrder = await OrderModel.create({
      clientId,
      total,
      status, // Usamos o status que foi passado pelo serviço
      products,
    });
    
    // @ts-ignore
    return newOrder.toObject();
  }
  
  // ADICIONADO: Método 'remove' para a lógica de compensação do Kafka
  async remove(id: string): Promise<FullOrder | null> {
    // @ts-ignore
    return OrderModel.findByIdAndDelete(id).lean();
  }

  async findAll(): Promise<FullOrder[]> {
    const orders = await OrderModel.find({})
      .populate('products.productId')
      .lean()
      .exec();
    return orders as unknown as FullOrder[];
  }


  async findById(id: string): Promise<FullOrder | null> {
    // @ts-ignore
    return OrderModel.findById(id).lean();
  }

  async findByClientId(clientId: string): Promise<FullOrder[]> {
    // @ts-ignore
    return OrderModel.find({ clientId }).sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, status: OrderStatus): Promise<FullOrder | null> {
    // @ts-ignore
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }
}