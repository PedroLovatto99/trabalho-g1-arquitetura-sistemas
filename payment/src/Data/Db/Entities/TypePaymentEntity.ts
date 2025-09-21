import { BaseEntity } from "./BaseEntity";
import { PaymentEntity } from "./PaymentEntity";

export class TypePaymentEntity extends BaseEntity {
  name!: string;
  payments?: PaymentEntity[];
}
