import { FullOrder, IOrderRepository } from "../../Infrastructure/Interfaces/IorderRepository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { ProductItem } from "@prisma/client";

export class OrderService implements IOrderService {
  // A dependência do productApi foi removida do construtor
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async create(dto: CreateOrderDTO): Promise<FullOrder> {
    if (!dto.clientId) throw new Error("ID do cliente é obrigatório.");
    if (!dto.products || dto.products.length === 0) throw new Error("O pedido precisa de produtos.");

    let total = 0;
    // Os dados dos produtos agora devem vir diretamente do DTO
    const productItems: ProductItem[] = dto.products.map(item => {
      // @ts-ignore - Assumindo que o DTO será atualizado para incluir estes campos
      if (!item.productId || !item.productName || item.unitPrice == null || !item.quantity) {
        throw new Error("Dados do produto incompletos no pedido.");
      }
      // @ts-ignore
      total += item.unitPrice * item.quantity;
      return {
        // @ts-ignore
        productId: item.productId,
        // @ts-ignore
        productName: item.productName,
        // @ts-ignore
        quantity: item.quantity,
        // @ts-ignore
        unitPrice: item.unitPrice,
      };
    });

    const createdOrder = await this.orderRepo.create(dto, total, productItems);

    // TODO: Disparar a criação do pagamento no microsserviço de 'payments'
    return createdOrder;
  }

  async findById(id: string): Promise<FullOrder | null> {
    return this.orderRepo.findById(id);
  }

  async findByClient(clientId: string): Promise<FullOrder[]> {
    return this.orderRepo.findByClientId(clientId);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDTO): Promise<FullOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Pedido não encontrado.");

    // A lógica de verificação e baixa de estoque foi removida.
    // O método agora apenas atualiza o status do pedido.

    const updatedOrder = await this.orderRepo.updateStatus(id, dto.status);
    if (!updatedOrder) throw new Error("Falha ao atualizar o status do pedido.");

    return updatedOrder;
  }
}