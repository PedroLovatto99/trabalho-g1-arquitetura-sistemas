import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../Dtos/PaymentDtos";

export interface IPaymentService {
  create(dto: CreatePaymentDTO): Promise<PaymentEntity>;
  get(id: string): Promise<PaymentEntity | null>;
  list(params?: {
    orderId?: string;
    typePaymentId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: PaymentEntity[];
    total: number;
    page: number;
    pageSize: number;
  }>;
  update(dto: UpdatePaymentDTO): Promise<PaymentEntity>;
  remove(id: string): Promise<void>;
  getOrderBalance(orderId: string): Promise<number>;
  processPayment(
    paymentId: string
  ): Promise<{ paymentId: string; status: string }>;
}
