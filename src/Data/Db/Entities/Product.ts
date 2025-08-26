import { BaseEntity } from "./BaseEntity";

export class ProductEntity extends BaseEntity {
  Name!: string;
  Price!: number;
  Stock!: number;
  quantity!: number;
}
