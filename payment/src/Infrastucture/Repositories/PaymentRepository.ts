import { PrismaClient, Prisma } from "@prisma/client";
import {
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../../Application/Dtos/PaymentDtos";
import { PaymentEntity } from "../../Data/Db/Entities/PaymentEntity";
import { IPaymentRepository } from "../Interfaces/IPaymentRepository";
import { PaymentMapper } from "../../Application/Mappers/PaymentMapper";

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePaymentDTO): Promise<PaymentEntity> {
    const created = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        typePaymentId: data.typePaymentId,
        amountPaid: new Prisma.Decimal(data.amountPaid),
        paidAt: data.paidAt ?? null,
      },
    });
    return PaymentMapper.toEntity(created);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const found = await this.prisma.payment.findUnique({ where: { id } });
    return found ? PaymentMapper.toEntity(found) : null;
  }

  async list(params?: {
    orderId?: string;
    typePaymentId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: PaymentEntity[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Math.max(params?.page ?? 1, 1);
    const pageSize = Math.min(Math.max(params?.pageSize ?? 20, 1), 200);
    const where: Prisma.PaymentWhereInput = {};
    if (params?.orderId !== undefined) {
      where.orderId = params.orderId;
    }
    if (params?.typePaymentId !== undefined) {
      where.typePaymentId = params.typePaymentId;
    }

    const [rows, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: PaymentMapper.toEntityList(rows),
      total,
      page,
      pageSize,
    };
  }

  async update(data: UpdatePaymentDTO): Promise<PaymentEntity> {
    const updateData: Prisma.PaymentUpdateInput = {};
    if (data.orderId !== undefined) updateData.orderId = data.orderId;
    if (data.typePaymentId !== undefined)
      updateData.typePayment = { connect: { id: data.typePaymentId } };
    if (data.amountPaid !== undefined)
      updateData.amountPaid = new Prisma.Decimal(data.amountPaid);
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;

    const updated = await this.prisma.payment.update({
      where: { id: data.id },
      data: updateData,
    });
    return PaymentMapper.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({ where: { id } });
  }

  async listByOrder(orderId: string): Promise<PaymentEntity[]> {
    const rows = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    return PaymentMapper.toEntityList(rows);
  }

  async sumByOrder(orderId: string): Promise<number> {
    const rows = await this.prisma.payment.findMany({
      where: { orderId },
      select: { amountPaid: true },
    });
    const total = rows.reduce((acc, r) => acc + Number(r.amountPaid), 0);
    return Number(total.toFixed(2));
  }
}
