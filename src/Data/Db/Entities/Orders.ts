import { BaseEntity } from "./BaseEntity";
import { ProductEntity } from "./Product";

export class OrderEntity extends BaseEntity {
    client!: String
    Products!: ProductEntity[]
}