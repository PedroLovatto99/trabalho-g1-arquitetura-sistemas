import { OrderStatus } from "@prisma/client";

// DTO para um produto ao criar um pedido
export interface CreateOrderProductDto {
  productId: string;
  quantity: number;
}

// DTO para criar um novo pedido
export interface CreateOrderDTO {
  clientId: string;
  products: CreateOrderProductDto[];
  typePaymentIds: string[];
}

// DTO para atualizar o status de um pedido
export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
