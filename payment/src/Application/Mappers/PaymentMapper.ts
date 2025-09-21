// src/domain/payments/PaymentMapper.ts

import { Payment } from "@prisma/client";
import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity";

export class PaymentMapper {
  static toEntity(p: Payment): PaymentEntity {
    const e = new PaymentEntity();
    e.id = p.id;
    e.orderId = p.orderId;
    e.typePaymentId = p.typePaymentId;
    e.amountPaid = Number(p.amountPaid);
    e.paidAt = p.paidAt ?? new Date(0);
    e.createdAt = p.createdAt;
    e.updatedAt = p.updatedAt;
    return e;
  }

  static toEntityList(list: Payment[]): PaymentEntity[] {
    return list.map(this.toEntity);
  }
}
