import { Payment, Prisma } from "@prisma/client";
import { UpdatePaymentDTO } from "../../Application/Dtos/PaymentDtos";

export interface IPaymentRepository {
  create(data: Prisma.PaymentCreateInput): Promise<Payment>;
  update(data: UpdatePaymentDTO): Promise<Payment | null>;
  delete(id: string): Promise<Payment | null>;
  findById(id: string): Promise<Payment | null>;
  list(params?: any): Promise<{ data: Payment[], total: number }>;
  sumByOrder(orderId: string): Promise<number>;
}