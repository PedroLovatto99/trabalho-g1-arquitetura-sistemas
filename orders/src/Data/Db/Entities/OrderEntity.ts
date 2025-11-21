import mongoose, { Schema, Document } from 'mongoose';
import { BaseEntity } from './BaseEntity';

export interface IProductItem extends Document {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder extends BaseEntity {
  clientId: string;
  products: IProductItem[];
  total: number;
  status: string;
}

const ProductItemSchema: Schema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
  clientId: { type: String, required: true },
  products: [ProductItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    // CORRIGIDO: Adicionamos os status que faltavam, incluindo PENDING_PAYMENT
    enum: [
      'PENDING_PAYMENT', 
      'PAYMENT_CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELED',
    ],
    // MUDANÇA: O status padrão de um novo pedido agora é PENDING_PAYMENT
    default: 'PENDING_PAYMENT',
  },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

export default mongoose.model<IOrder>('Order', OrderSchema);