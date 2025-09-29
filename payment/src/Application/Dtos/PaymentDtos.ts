export type CreatePaymentDTO = {
  orderId: string;
  typePaymentId: string;
  amountPaid: number;
  paidAt?: Date | null;
};

export type UpdatePaymentDTO = {
  id: string;
  orderId?: string;
  statusId?: number;
  typePaymentId?: string;
  amountPaid?: number;
  paidAt?: Date | null;
};
