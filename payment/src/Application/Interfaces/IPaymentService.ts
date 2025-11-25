import { Payment } from '@prisma/client'; // CORRIGIDO: Usa o tipo do Prisma
import { CreatePaymentDTO, UpdatePaymentDTO } from '../Dtos/PaymentDtos';

export interface IPaymentService {
  create(dto: CreatePaymentDTO): Promise<Payment>;
  processPayment(paymentId: string): Promise<{ paymentId: string; status: string; orderId?: string }>;
  findById(id: string): Promise<Payment | null>;
  list(params?: any): Promise<{ data: Payment[], total: number }>;
  update(dto: UpdatePaymentDTO): Promise<Payment | null>;
  remove(id: string): Promise<Payment | null>;
  getOrderBalance(orderId: string): Promise<any>;
  listTypes(): Promise<any[]>;
}