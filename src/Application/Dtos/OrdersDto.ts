export interface CreateOrderDTO {
  client: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrderResponseDTO {
  id: string;
  client: string;
  createdAt: Date;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}
