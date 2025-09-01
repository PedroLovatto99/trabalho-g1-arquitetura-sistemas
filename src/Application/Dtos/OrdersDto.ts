export interface CreateOrderDTO {
  client: string;
  products: {
    productSlug: string;
    quantity: number;
  }[];
}

export interface OrderResponseDTO {
  id: string;
  client: string;
  createdAt: Date;
  slug: string;
  products: {
    slug: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}
