import { IOrderRepository } from "../Interfaces/IorderRepository";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { prisma } from "../../Data/Db/Configurations/prisma";
import { OrderEntity } from "../../Data/Db/Entities/Orders";
import type { Order, ProductsOnOrders, Product, Prisma } from "@prisma/client";

type OrderWithProducts = Order & {
  products: (ProductsOnOrders & { product: Product })[];
};

export class OrderRepository implements IOrderRepository {
  update(
    slug: string,
    orderData: Partial<OrderEntity>
  ): Promise<OrderEntity | null> {
    throw new Error("Method not implemented.");
  }
  delete(slug: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async create(orderData: OrderEntity): Promise<OrderEntity> {
    const createdOrder = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // PASSO 1: Obter os IDs de todos os produtos no pedido.
        const productIds = orderData.Products.map((item) => item.productId);

        // PASSO 2: Buscar todos os produtos do banco de uma só vez DENTRO da transação.
        // Isso garante que estamos lendo o estado mais atual do estoque.
        const productsInDb = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        // Mapear produtos por ID para fácil acesso
        const productMap = new Map(productsInDb.map((p) => [p.id, p]));

        // PASSO 3: Validar o estoque para cada item do pedido.
        console.log("🚀 ~ OrderRepository ~ create ~ orderData.Products:", orderData.Products)
        console.log("🚀 ~ OrderRepository ~ create ~ productMap:", productMap)
        console.log("🚀 ~ OrderRepository ~ create ~ productsInDb:", productsInDb)
        console.log("🚀 ~ OrderRepository ~ create ~ productIds:", productIds)
        for (const item of orderData.Products) {
          const product = productMap.get(item.productId);
          console.log("🚀 ~ OrderRepository ~ create ~ item:", item)

          if (!product) {
            throw new Error(`Produto com ID ${item.productId} não encontrado.`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Estoque insuficiente para o produto "${product.name}". Pedido: ${item.quantity}, Estoque: ${product.stock}`
            );
          }
        }

        // PASSO 4: Criar o pedido (seu código original).
        const order = await tx.order.create({
          data: {
            id: orderData.id,
            clientName: orderData.client,
            createdAt: orderData.createdAt,
            slug: orderData.slug,
          },
        });

        // PASSO 5: Conectar os produtos ao pedido (seu código original).
        const productsToConnect = orderData.Products.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
        }));

        await tx.productsOnOrders.createMany({
          data: productsToConnect,
        });

        // PASSO 6: Decrementar o estoque dos produtos.
        const updateStockPromises = orderData.Products.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        );

        // Executa todas as atualizações de estoque em paralelo.
        await Promise.all(updateStockPromises);

        // PASSO 7: Retornar o pedido completo (seu código original).
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
      }
    );

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
    // orderEntity.slug = prismaOrder.slug;

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
