export type CreatePaymentDTO = {
  orderId: string;
  typePaymentIds: string[]; 
  amountPaid: number;
  paidAt?: Date | null;
};

export type UpdatePaymentDTO = {
  id: string;
  orderId?: string;
  statusId?: number;
  typePaymentIds?: string[];
  amountPaid?: number;
  paidAt?: Date | null;
};
