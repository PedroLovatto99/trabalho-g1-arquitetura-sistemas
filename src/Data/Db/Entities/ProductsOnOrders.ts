// src/Data/Db/Entities/ProductsOnOrders.ts

import { ProductEntity } from "./Product";
import { OrderEntity } from "./Orders";

export class ProductsOnOrdersEntity {
  orderId!: string;
  productId!: string;
  quantity!: number;

  product?: ProductEntity;
  order?: OrderEntity;

  constructor(props: {
    orderId?: string;
    productId: string;
    quantity: number;
  }) {
    Object.assign(this, props);
  }
}