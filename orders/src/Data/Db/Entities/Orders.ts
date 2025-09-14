import { BaseEntity } from "./BaseEntity";
import { ProductEntity } from "./Product";
import { ProductsOnOrdersEntity } from "./ProductsOnOrders";

export class OrderEntity extends BaseEntity {
    client!: string
    Products!: ProductsOnOrdersEntity[]
}