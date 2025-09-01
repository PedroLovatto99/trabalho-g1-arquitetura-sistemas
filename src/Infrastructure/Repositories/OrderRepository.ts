import { IOrderRepository } from "../Interfaces/IOrderRepository";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { prisma } from "../../Data/Db/Configurations/prisma";
import { OrderEntity } from "../../Data/Db/Entities/Orders";
import { PrismaClient } from "@prisma/client";
import type { Order, ProductsOnOrders, Product } from "@prisma/client";

type OrderWithProducts = Order & {
  products: (ProductsOnOrders & { product: Product })[];
};

export class OrderRepository implements IOrderRepository {

  async create(orderData: OrderEntity): Promise<OrderEntity> {
  
    const createdOrder = await prisma.$transaction(async (tx:PrismaClient) => {
     
      const order = await tx.order.create({
        data: {
          id: orderData.id,
          clientName: orderData.client,
          createdAt: orderData.createdAt,
          slug: orderData.slug
        },
      });

    
      const productsToConnect = orderData.Products.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        //slug : order.slug
      }));


      await tx.productsOnOrders.createMany({
        data: productsToConnect,
      });

     
      const fullOrder = await tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          products: { 
            include: {
              product: true, 
            },
          },
        },
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

    return orders.map((order: OrderWithProducts) => this.mapToEntity(order));
  }

 
  private mapToEntity(prismaOrder: any): OrderEntity {
    const orderEntity = new OrderEntity();
    orderEntity.id = prismaOrder.id;
    orderEntity.client = prismaOrder.clientName;
    orderEntity.createdAt = prismaOrder.createdAt;
    
    orderEntity.Products = prismaOrder.products.map((item: any) => {
      const productEntity = new ProductEntity();
      productEntity.id = item.product.id;
      productEntity.name = item.product.name;
      productEntity.price = item.product.price;
      productEntity.stock = item.product.stock;
      productEntity.slug = item.product.slug;
      productEntity.createdAt = item.product.createdAt;

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