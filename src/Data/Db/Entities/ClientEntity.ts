import { BaseEntity } from "./BaseEntity";
import { OrderEntity } from "./Orders";

export class ClientEntity extends BaseEntity {
  name: string;
  email: string;
  isDeleted: boolean;
  orders?: any[];

  constructor(
    props: {
      name: string;
      email: string;
      isDeleted?: boolean;
    } & Partial<BaseEntity> 
  ) {
    super(props); 
    this.name = props.name;
    this.email = props.email;
    this.isDeleted = props.isDeleted ?? false;
  }
}
