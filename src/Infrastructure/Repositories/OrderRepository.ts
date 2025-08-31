// src/Infrastructure/Repositories/OrderRepository.ts

import { IOrderRepository } from "../Interfaces/IOrderRepository";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { prisma } from "../../Data/Db/Configurations/prisma";
import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { Prisma } from "@prisma/client";

const orderWithProductsPayload = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: { products: { include: { product: true } } },
});
type OrderWithProducts = Prisma.OrderGetPayload<
  typeof orderWithProductsPayload
>;

export class OrderRepository implements IOrderRepository {
  async create(orderData: OrderEntity): Promise<OrderEntity> {
    const createdOrder = await prisma.$transaction(async (tx) => {
     
      const order = await tx.order.create({
        data: {
          id: orderData.id,
          clientName: orderData.client,
          createdAt: orderData.createdAt,
          slug: orderData.slug,
        },
      });

      const productsToConnect = [];

     
      for (const item of orderData.Products) { 
        const product = await tx.product.findUniqueOrThrow({
          where: { slug: item.productId },
        });

        
        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para o produto: ${product.name}`
          );
        }
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        
        productsToConnect.push({
          orderId: order.id,
          productId: product.id, 
          quantity: item.quantity,
        });
      }

      await tx.productsOnOrders.createMany({
        data: productsToConnect,
      });

      const fullOrder = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { products: { include: { product: true } } },
      });

      return fullOrder;
    });

    return this.mapToEntity(createdOrder);
  }

  async findBySlug(slug: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return order ? this.mapToEntity(order) : null;
  }

  async findMany(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders.map((order) => this.mapToEntity(order));
  }

  private mapToEntity(prismaOrder: OrderWithProducts): OrderEntity {
    const orderEntity = new OrderEntity();
    orderEntity.id = prismaOrder.id;
    orderEntity.slug = prismaOrder.slug;
    orderEntity.client = prismaOrder.clientName;
    orderEntity.createdAt = prismaOrder.createdAt;

    orderEntity.Products = prismaOrder.products.map((item) => {
      const productEntity = new ProductEntity();
      productEntity.id = item.product.id;
      productEntity.Name = item.product.name;
      productEntity.Price = item.product.price;
      productEntity.Stock = item.product.stock;
      productEntity.slug = item.product.slug;

      const productOnOrder = new ProductsOnOrdersEntity({
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
      });
      productOnOrder.product = productEntity;

      return productOnOrder;
    });

    return orderEntity;
  }
}
