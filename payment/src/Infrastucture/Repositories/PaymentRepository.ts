import { PrismaClient, Prisma, Payment } from "@prisma/client"; // Importa 'Payment'
import { UpdatePaymentDTO } from "../../Application/Dtos/PaymentDtos";
import { IPaymentRepository } from "../Interfaces/IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ 
      where: { id },
      include: {
        typePayments: true,
        status: true
      }
    });
  }

  async list(params?: {
    orderId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Payment[]; total: number }> {
    const page = Math.max(params?.page ?? 1, 1);
    const pageSize = Math.min(Math.max(params?.pageSize ?? 20, 1), 200);
    const where: Prisma.PaymentWhereInput = {};
    if (params?.orderId) where.orderId = params.orderId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          typePayments: true,
          status: true
        }
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  async update(data: UpdatePaymentDTO): Promise<Payment | null> {
    // CORRIGIDO: Constrói o payload dinamicamente
    const updateData: Prisma.PaymentUpdateInput = {};
    if (data.statusId !== undefined) {
      updateData.status = { connect: { id: data.statusId } };
    }
    if (data.amountPaid !== undefined) {
      updateData.amountPaid = data.amountPaid;
    }
    if (data.paidAt !== undefined) {
      updateData.paidAt = data.paidAt;
    }

    return this.prisma.payment.update({
      where: { id: data.id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Payment | null> {
    return this.prisma.payment.delete({ where: { id } });
  }

  async sumByOrder(orderId: string): Promise<number> {
    const result = await this.prisma.payment.aggregate({
      _sum: { amountPaid: true },
      where: { orderId },
    });
    return Number(result._sum.amountPaid) || 0;
  }
}