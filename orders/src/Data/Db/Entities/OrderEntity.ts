// Data/Db/Entities/OrderEntity.ts
import { Schema, model, Types } from "mongoose";

export interface IProductItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export interface IOrder {
  clientId: string;
  total: number;
  status: OrderStatus;
  products: IProductItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    clientId: { type: String, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "AWAITING_PAYMENT",
        "PAYMENT_PROCESSING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
      ],
      default: "AWAITING_PAYMENT",
    },
    products: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        unitPrice: Number,
      },
    ],
  },
  { timestamps: true, versionKey: false , toJSON: { virtuals: true },
    toObject: { virtuals: true }}
);

// virtual id (string)
OrderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// normaliza saída
const transform = (_: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};
OrderSchema.set("toJSON", { virtuals: true, transform });
OrderSchema.set("toObject", { virtuals: true, transform });

const OrderModel = model<IOrder>("Order", OrderSchema);
export default OrderModel;
