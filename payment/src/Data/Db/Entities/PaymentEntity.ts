import { BaseEntity } from "./BaseEntity";

export class PaymentEntity extends BaseEntity {
  orderId!: string; 
  typePaymentId!: string; 
  amountPaid!: number; 
  paidAt?: Date;

}
