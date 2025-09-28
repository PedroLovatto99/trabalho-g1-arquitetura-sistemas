// src/Domain/Models/OrderModel.ts

import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from "@prisma/client"; // Você pode manter este enum ou criar um novo

// Interface para tipagem forte do item de produto
export interface IProductItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

// Interface para tipagem forte do documento de Pedido
export interface IOrder extends Document {
    clientId: string;
    total: number;
    status: OrderStatus;
    products: IProductItem[];
    createdAt: Date;
    updatedAt: Date;
}

// Sub-schema para os produtos dentro do pedido
const ProductItemSchema: Schema = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
}, { _id: false }); // _id: false para não criar IDs para os subdocumentos

// Schema principal do Pedido
const OrderSchema: Schema = new Schema({
    clientId: { type: String, required: true, index: true },
    total: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    products: [ProductItemSchema],
},{
    timestamps: true,
    versionKey: false,
    // ADICIONE ESTA CONFIGURAÇÃO:
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

OrderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Exporta o model
export default mongoose.model<IOrder>('Order', OrderSchema);