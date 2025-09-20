import { BaseEntity } from "./BaseEntity";

export class ProductEntity extends BaseEntity {
  name!: string;
  price!: number;
  stock!: number;
  isDeleted!: boolean;
}
