export class TypePaymentEntity {
  public readonly id: number;
  public name: string;

  constructor(props: { id: number; name: string }) {
    this.id = props.id;
    this.name = props.name;
  }
}