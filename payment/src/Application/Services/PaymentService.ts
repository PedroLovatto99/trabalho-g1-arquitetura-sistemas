import { IPaymentRepository } from "../../Infrastucture/Interfaces/IPaymentRepository";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../Dtos/PaymentDtos";
import { IPaymentService } from "../Interfaces/IPaymentService";

export class PaymentService implements IPaymentService {
  constructor(private readonly repo: IPaymentRepository) {}

  create(dto: CreatePaymentDTO) {
    if (dto.amountPaid <= 0) throw new Error("amountPaid must be > 0");
    return this.repo.create(dto);
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  list(params?: {
    orderId?: string;
    typePaymentId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.repo.list(params);
  }

  update(dto: UpdatePaymentDTO) {
    if (dto.amountPaid !== undefined && dto.amountPaid <= 0) {
      throw new Error("amountPaid must be > 0");
    }
    return this.repo.update(dto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async getOrderBalance(orderId: string) {
    return this.repo.sumByOrder(orderId);
  }
}
