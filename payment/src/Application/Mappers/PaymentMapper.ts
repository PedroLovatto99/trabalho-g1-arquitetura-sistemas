import { Payment, Status, TypePayment } from "@prisma/client";
import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity";
import { TypePaymentEntity } from "../../Data/Db/Entities/TypePaymentEntity";

type PaymentWithRelations = Payment & {
  status?: Status;
  typePayments?: TypePayment[];
};

export class PaymentMapper {
  static toEntity(p: PaymentWithRelations): PaymentEntity {
    const e = new PaymentEntity();
    e.id = p.id;
    e.orderId = p.orderId;
    e.typePayments = (p.typePayments || []).map(tp => {
      const typePayment = new TypePaymentEntity();
      typePayment.id = tp.id;
      typePayment.name = tp.name;
      // Como TypePayment não tem createdAt/updatedAt, usamos valores padrão
      typePayment.createdAt = new Date();
      typePayment.updatedAt = new Date();
      return typePayment;
    });
    e.amountPaid = Number(p.amountPaid);
    e.paidAt = p.paidAt ?? new Date(0);
    e.createdAt = p.createdAt;
    e.updatedAt = p.updatedAt;
    e.status = p.status ? {
      id: p.status.id,
      name: p.status.name
    } : undefined;
    return e;
  }

  static toEntityList(list: PaymentWithRelations[]): PaymentEntity[] {
    return list.map(this.toEntity);
  }
}