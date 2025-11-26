import { OrderStatus } from "@prisma/client";
import { IProductItem } from "../../Data/Db/Entities/OrderEntity";

// Este tipo representa um pedido completo do Mongoose, incluindo o _id
export type FullOrder = {
  _id: string;
  clientId: string;
  total: number;
  products: IProductItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

// ADICIONADO: A definição da interface que estava faltando.
// Este tipo representa os DADOS PUROS de um item de produto, sem a complexidade do Mongoose.
export interface ProductItemData {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Agora, este tipo pode encontrar a definição de 'ProductItemData' sem erro.
export type CreateOrderData = {
  clientId: string;
  total: number;
  products: ProductItemData[]; 
  status: string | OrderStatus;
};

// A interface IOrderRepository define o contrato que o repositório deve seguir.
export interface IOrderRepository {
  create(data: CreateOrderData): Promise<FullOrder>;
  remove(id: string): Promise<FullOrder | null>;
  findById(id: string): Promise<FullOrder | null>;
  findByClientId(clientId: string): Promise<FullOrder[]>;
  updateStatus(id: string, status: OrderStatus): Promise<FullOrder | null>;
  findAll(): Promise<FullOrder[]>; 
}