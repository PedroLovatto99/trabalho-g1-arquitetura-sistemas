// src/domain/payments/IPaymentRepository.ts

import { CreatePaymentDTO, UpdatePaymentDTO } from "../../Application/Dtos/PaymentDtos"
import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity"



export interface IPaymentRepository {
  create(data: CreatePaymentDTO): Promise<PaymentEntity>
  findById(id: string): Promise<PaymentEntity | null>
  list(params?: {
    orderId?: string
    typePaymentId?: string
    page?: number
    pageSize?: number
  }): Promise<{ data: PaymentEntity[]; total: number; page: number; pageSize: number }>
  update(data: UpdatePaymentDTO): Promise<PaymentEntity>
  delete(id: string): Promise<void>

  // utilitários comuns
  listByOrder(orderId: string): Promise<PaymentEntity[]>
  sumByOrder(orderId: string): Promise<number>
}
