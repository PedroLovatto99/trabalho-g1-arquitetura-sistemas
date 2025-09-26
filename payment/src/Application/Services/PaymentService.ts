import { TypePaymentEntity } from "../../Data/Db/Entities/TypePaymentEntity";
import { IOrderApi } from "../../External/apiOrders";
import { IProductApi } from "../../External/apiProducts";
import { IPaymentRepository } from "../../Infrastucture/Interfaces/IPaymentRepository";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../Dtos/PaymentDtos";
import { IPaymentService } from "../Interfaces/IPaymentService";

export class PaymentService implements IPaymentService {
  constructor(
    private readonly repo: IPaymentRepository,
    private readonly orderApi: IOrderApi,
    private readonly productApi: IProductApi
  ) {}

  create(dto: CreatePaymentDTO) {
    if (dto.amountPaid <= 0) throw new Error("amountPaid must be > 0");
    return this.repo.create(dto);
  }

  async processPayment(
    paymentId: string
  ): Promise<{ paymentId: string; status: string; orderId?: string }> {
    const payment = await this.get(paymentId);

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    const order = await this.orderApi.getOrder(payment.orderId);

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    const productIds = order.products.map((p) => p.productId);
    const productsFromService = await this.productApi.findManyByIds(productIds);

    if (productsFromService.length !== productIds.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    await Promise.all(
      order.products.map((p) =>
        this.productApi.adjustStock(p.productId, p.quantity)
      )
    );

    const approved = Math.random() > 0.5;
    const newStatus = approved ? "2" : "3";

    await this.orderApi.updateStatus(order.id, { status: newStatus });
    await this.repo.update({
      id: paymentId,
      typePaymentId: newStatus,
      paidAt: approved ? new Date() : null,
    });

    return { paymentId, status: newStatus, orderId: payment?.orderId ?? "" };
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  list(params?: {
    orderId?: string;
    typePaymentId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.repo.list(params);
  }

  update(dto: UpdatePaymentDTO) {
    if (dto.amountPaid !== undefined && dto.amountPaid <= 0) {
      throw new Error("amountPaid must be > 0");
    }
    return this.repo.update(dto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async getOrderBalance(orderId: string) {
    return this.repo.sumByOrder(orderId);
  }
}
