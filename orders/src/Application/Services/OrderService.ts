import { paymentsApi } from "../../External/api";
import { IPaymentApi } from "../../External/apiPayments";
import { IProductApi } from "../../External/apiProducts";
import {
  FullOrder,
  IOrderRepository,
} from "../../Infrastructure/Interfaces/IorderRepository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { ProductItem } from "@prisma/client";

export class OrderService implements IOrderService {
  // A dependência do productApi foi removida do construtor
  constructor(
    private orderRepo: IOrderRepository,
    private paymentServiceApi: IPaymentApi,
    private productsServiceApi: IProductApi
  ) {}

  async create(dto: CreateOrderDTO): Promise<FullOrder> {
    if (!dto.clientId) throw new Error("ID do cliente é obrigatório.");
    if (!Array.isArray(dto.products) || dto.products.length === 0) {
      throw new Error("O pedido precisa de produtos.");
    }

    // 1) Normaliza e valida quantidades do DTO (soma duplicados)
    const qtyById = new Map<string, number>();
    for (const [i, p] of dto.products.entries()) {
      if (!p.productId)
        throw new Error(`Produto[${i}]: productId obrigatório.`);
      const q = Number(p.quantity);
      if (!Number.isFinite(q) || q <= 0)
        throw new Error(`Produto[${i}]: quantity inválido.`);
      qtyById.set(p.productId, (qtyById.get(p.productId) ?? 0) + q);
    }

    // 2) Busca produtos no serviço e confere existência
    const uniqueIds = [...qtyById.keys()];
    const productsFromService = await this.productsServiceApi.findManyByIds(
      uniqueIds
    );

    if (productsFromService.length !== uniqueIds.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    // 3) Monta items e calcula total (usa nome/preço do serviço + qty do DTO)
    const productItems: ProductItem[] = productsFromService.map((sp) => {
      const quantity = qtyById.get(sp.id)!; // garantido existir
      const unitPrice = Number(sp.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Preço inválido para o produto ${sp.id}.`);
      }
      return {
        productId: sp.id,
        productName: sp.name,
        unitPrice,
        quantity,
      };
    });

    const total = productItems.reduce(
      (sum, it) => sum + it.unitPrice * it.quantity,
      0
    );

    // 4) Cria pedido e pagamento
    const createdOrder = await this.orderRepo.create(dto, total, productItems);

    const createPayment = await this.paymentServiceApi.createPayment({
      orderId: createdOrder.id,
      amountPaid: total,
      typePaymentId: dto.typePaymentId,
    });

    // 5) Retorna FullOrder (pedido + paymentId)
    return {
      ...createdOrder,
      paymentId: createPayment.id,
    };
  }
  async findById(id: string): Promise<FullOrder | null> {
    return this.orderRepo.findById(id);
  }

  async findByClient(clientId: string): Promise<FullOrder[]> {
    return this.orderRepo.findByClientId(clientId);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDTO
  ): Promise<FullOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Pedido não encontrado.");

    // A lógica de verificação e baixa de estoque foi removida.
    // O método agora apenas atualiza o status do pedido.

    const updatedOrder = await this.orderRepo.updateStatus(id, dto.status);
    if (!updatedOrder)
      throw new Error("Falha ao atualizar o status do pedido.");

    return updatedOrder;
  }
}
