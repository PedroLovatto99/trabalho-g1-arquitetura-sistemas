// src/domain/payments/PaymentMapper.ts

import { Payment } from "@prisma/client";
import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity";

export class PaymentMapper {
  static toEntity(p: Payment & { status?: { id: string; name: string } }): PaymentEntity {
    const e = new PaymentEntity();
    e.id = p.id;
    e.orderId = p.orderId;
    e.typePaymentId = p.typePaymentId;
    e.amountPaid = Number(p.amountPaid);
    e.paidAt = p.paidAt ?? new Date(0);
    e.createdAt = p.createdAt;
    e.updatedAt = p.updatedAt;
    e.status = p.status ? {
      id: p.status.id,  // O ID já vem como number do Prisma
      name: p.status.name
    } : undefined;
    return e;
  }

  static toEntityList(list: Payment[]): PaymentEntity[] {
    return list.map(this.toEntity);
  }
}
