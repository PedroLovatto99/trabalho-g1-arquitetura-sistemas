export interface CreateOrderDTO {
  clientSlug: string;
  products: {
    productSlug: string;
    quantity: number;
  }[];
}

export interface PaymentDTO {
  typePaymentId: number;
  total: number;
}

export interface ConfirmPaymentDTO {
  payments: PaymentDTO[];
}

export interface OrderResponseDTO {
    id: string;
    slug: string;
    createdAt: Date;
    status: { name: string };
    client: { id: string; name: string };
    products: {
        name: string;
        price: number;
        quantity: number;
    }[];
    payments: {
        total: number;
        type: string;
    }[];
}