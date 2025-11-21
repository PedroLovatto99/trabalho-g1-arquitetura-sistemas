export interface CreatePaymentDTO {
    orderId: string;
    amountPaid: number;
    clientId: string;
    typePaymentIds: string[];
    // REMOVIDO: statusId é uma regra de negócio interna, não deve vir do Kafka.
}

export interface UpdatePaymentDTO {
    id: string;
    // CORRIGIDO: Usa statusId para alinhar com o schema do Prisma.
    statusId?: number; 
    amountPaid?: number;
    paidAt?: Date | null;
}