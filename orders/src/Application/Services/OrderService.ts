import { IPaymentApi } from "../../External/api_payments";
import { IProductApi, Product } from "../../External/api_products";
import {
  FullOrder,
  IOrderRepository,
} from "../../Infrastructure/Interfaces/IorderRepository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { OrderStatus } from "@prisma/client";

interface ProductItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}
export class OrderService implements IOrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private productApi: IProductApi,
    private paymentServiceApi: IPaymentApi, // Adicione o cliente HTTP do serviço de pagamentos se necessário
  ) {}

  async create(dto: CreateOrderDTO): Promise<FullOrder> {
    console.log("🚀 ~ OrderService ~ create ~ dto:", dto)
    if (!dto.clientId) throw new Error("ID do cliente é obrigatório.");
    if (!dto.products || dto.products.length === 0)
      throw new Error("O pedido precisa de produtos.");

    const productIds = dto.products.map((p) => p.productId);
    const productsFromService = await this.productApi.findManyByIds(productIds);

    if (productsFromService.length !== productIds.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }
     console.log("🚀 ~ OrderService ~ create ~ dto:", dto)
    let total = 0;
    const productItems: ProductItem[] = dto.products.map((item) => {
      const productInfo = productsFromService.find(
        (p: Product) => p.id === item.productId
      );
      if (!productInfo)
        throw new Error(`Produto ${item.productId} não encontrado.`);
      total += productInfo.price * item.quantity;
      return {
        productId: item.productId,
        productName: productInfo.name,
        quantity: item.quantity,
        unitPrice: productInfo.price,
      };
    });
   

    const createdOrder = await this.orderRepo.create(dto, total, productItems);
    const createPayment = await this.paymentServiceApi.createPayment({
      orderId: createdOrder.id,
      amountPaid: total,
      typePaymentId: dto.typePaymentId,
    });
    
    return createdOrder;
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

    if (
      dto.status === OrderStatus.PAID &&
      order.status === OrderStatus.AWAITING_PAYMENT
    ) {
      const productIds = order.products.map((p) => p.productId);
      const productsFromService = await this.productApi.findManyByIds(
        productIds
      );

      for (const item of order.products) {
        const productInfo = productsFromService.find(
          (p: Product) => p.id === item.productId
        );
        if (!productInfo || productInfo.stock < item.quantity) {
          await this.orderRepo.updateStatus(id, "CANCELED");
          throw new Error(
            `Estoque insuficiente para o produto ${item.productName}. Pedido cancelado.`
          );
        }
      }

      await Promise.all(
        order.products.map((item) =>
          this.productApi.adjustStock(item.productId, -item.quantity)
        )
      );
    }

    const updatedOrder = await this.orderRepo.updateStatus(id, dto.status);
    if (!updatedOrder)
      throw new Error("Falha ao atualizar o status do pedido.");

    return updatedOrder;
  }
}
