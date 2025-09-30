import { BaseEntity } from "./BaseEntity";
import { TypePaymentEntity } from "./TypePaymentEntity";

export class PaymentEntity extends BaseEntity {
  orderId!: string; 
  typePayments!: TypePaymentEntity[]; 
  amountPaid!: number; 
  paidAt?: Date;
  status?: { id: number; name: string; } | undefined;
}
