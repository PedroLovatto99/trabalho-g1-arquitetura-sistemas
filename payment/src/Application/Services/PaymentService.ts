import { Payment } from "@prisma/client";
import { IOrderApi } from "../../External/apiOrders";
import { IProductApi } from "../../External/apiProducts";
import { UserApi } from "../../External/apiUsers";
import { IPaymentRepository } from "../../Infrastucture/Interfaces/IPaymentRepository";
import { sendPaymentNotification } from "../rabbitmq/notification_producer";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../Dtos/PaymentDtos";
import { IPaymentService } from "../Interfaces/IPaymentService";

export class PaymentService implements IPaymentService {
  constructor(
    private paymentRepository: IPaymentRepository,
    private orderApi: IOrderApi,
    private productApi: IProductApi,
    private userApi: UserApi
  ) {}

  async create(dto: CreatePaymentDTO): Promise<Payment> {
    console.log(`[+] Criando pagamento para o pedido ${dto.orderId} com status PENDING.`);
    
    // CORRIGIDO: O serviço agora passa um objeto de dados simples para o repositório.
    // A lógica de negócio ("statusId: 1") está aqui. A lógica de dados está no repositório.
    return this.paymentRepository.create({
      orderId: dto.orderId,
      clientId: dto.clientId,
      amountPaid: dto.amountPaid,
      statusId: 1, // Assumindo 1 = PENDING
      // A relação 'paymentMethods' é tratada pelo Prisma no repositório.
    });
  }

  async processPayment(
    paymentId: string
  ): Promise<{ paymentId: string; status: string; orderId?: string; }> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Pagamento não encontrado");

    const order = await this.orderApi.getOrder(payment.orderId);
    if (!order) throw new Error("Pedido não encontrado");
    
    const approved = Math.random() > 0.5;
    
    const newStatusName = approved ? "APPROVED" : "REJECTED";
    const newStatusId = approved ? 2 : 3;

    await this.orderApi.updateStatus(order._id, { status: newStatusName });
    
    await this.paymentRepository.update({
      id: paymentId,
      statusId: newStatusId,
      paidAt: approved ? new Date() : null,
    });
    
    if (approved) {
      const user = await this.userApi.getUser(order.clientId);
      if (user) {
        await sendPaymentNotification({ orderId: order._id, userName: user.name });
      }
    }

    return { paymentId, status: newStatusName, orderId: payment.orderId };
  }

  findById(id: string) {
    return this.paymentRepository.findById(id);
  }

  list(params?: any) {
    return this.paymentRepository.list(params);
  }

  update(dto: UpdatePaymentDTO) {
    if (dto.amountPaid !== undefined && dto.amountPaid <= 0) {
      throw new Error("amountPaid must be > 0");
    }
    return this.paymentRepository.update(dto);
  }

  remove(id: string) {
    return this.paymentRepository.delete(id);
  }

  getOrderBalance(orderId: string) {
    return this.paymentRepository.sumByOrder(orderId);
  }
}