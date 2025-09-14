import { BaseEntity } from "./BaseEntity";

export class ClientEntity extends BaseEntity {
  name!: string;
  email!: string;
  isDeleted!: boolean;
}
