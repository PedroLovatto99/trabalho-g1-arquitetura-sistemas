import { Product, ProductsOnOrders } from "@prisma/client";
import { BaseEntity } from "./BaseEntity";
import { OrderPaymentEntity } from "./OrderPaymentEntity";
import { StatusPayment } from "../Enums/StatusPayment";
import { ProductsOnOrdersEntity } from "./ProductsOnOrders";

export class OrderEntity extends BaseEntity {
  clientId!: string;
  statusId!: number;
  isDeleted!: boolean;
  products!: ProductsOnOrdersEntity[];         
  payments!: OrderPaymentEntity[];
  constructor(init: {
    id?: string;
    slug?: string;
    createdAt?: Date;
    clientId: string;
    statusId?: number;
    isDeleted?: boolean;
    products: ProductsOnOrdersEntity[];
    payments?: OrderPaymentEntity[];
  }) {
    super(init);
    this.clientId = init.clientId;
    this.statusId = init.statusId ?? StatusPayment.AGUARDANDO_PAGAMENTO;
    this.isDeleted = init.isDeleted ?? false;
    this.products = init.products ?? [];
    this.payments = init.payments ?? [];
  }
}
