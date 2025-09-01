import { IOrderRepository } from "../Interfaces/IorderRepository";
import { ProductsOnOrdersEntity } from "../../Data/Db/Entities/ProductsOnOrders";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { prisma } from "../../Data/Db/Configurations/prisma";
import { OrderEntity } from "../../Data/Db/Entities/Orders";
import type { Order, ProductsOnOrders, Product, Prisma } from "@prisma/client";
import { UpdateOrderDTO } from "../../Application/Dtos/OrdersDto";

type OrderWithProducts = Order & {
  products: (ProductsOnOrders & { product: Product })[];
};

export class OrderRepository implements IOrderRepository {
  async create(orderData: OrderEntity): Promise<OrderEntity> {
    const createdOrder = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const productSlugs = orderData.Products.map((item) => item.productId);

        const productsInDb = await tx.product.findMany({
          where: {
            slug: {
              in: productSlugs,
            },
          },
        });

        const productMap = new Map(productsInDb.map((p) => [p.slug, p]));

        for (const item of orderData.Products) {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new Error(
              `Produto com slug "${item.productId}" não encontrado.`
            );
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Estoque insuficiente para o produto "${product.name}". Pedido: ${item.quantity}, Estoque: ${product.stock}`
            );
          }
        }

        const order = await tx.order.create({
          data: {
            id: orderData.id,
            clientName: orderData.client,
            createdAt: orderData.createdAt,
            slug: orderData.slug,
          },
        });

        const productsToConnect = orderData.Products.map((item) => {
          const product = productMap.get(item.productId);
          return {
            orderId: order.id,
            productId: product!.id,
            quantity: item.quantity,
          };
        });

        await tx.productsOnOrders.createMany({
          data: productsToConnect,
        });

        const updateStockPromises = orderData.Products.map((item) => {
          const product = productMap.get(item.productId);
          return tx.product.update({
            where: { id: product!.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        });

        await Promise.all(updateStockPromises);

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
    console.log("🚀 ~ OrderRepository ~ findBySlug ~ slug:", slug);
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
    console.log("🚀 ~ OrderRepository ~ findBySlug ~ order:", order);

    if (!order) {
      return null;
    }
    return this.mapToEntity(order);
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

 async update(slug: string, dto: UpdateOrderDTO): Promise<OrderEntity | null> {
  const updatedOrderInDb = await prisma.$transaction(async (tx) => {
    // 1) Pedido atual + itens (tabela intermediária)
    const existingOrder = await tx.order.findUnique({
      where: { slug },
      include: { products: true }, // ProductsOnOrders[]
    });
    if (!existingOrder) {
      throw new Error(`Pedido com slug "${slug}" não foi encontrado.`);
    }

    // Mapa antigo: productId -> qty
    const oldProducts = new Map<string, number>(
      existingOrder.products.map((p) => [p.productId, p.quantity]),
    );

    // 2) Resolver novos produtos a partir de slug (se enviados)
    const newProducts = new Map<string, number>(); // productId -> qty
    if (dto.products && dto.products.length > 0) {
      const slugs = dto.products.map((p) => p.productSlug);
      const productsFromDb = await tx.product.findMany({
        where: { slug: { in: slugs } },
      });

      const bySlug = new Map(productsFromDb.map((p) => [p.slug, p]));
      for (const item of dto.products) {
        const prod = bySlug.get(item.productSlug);
        if (!prod) {
          throw new Error(`Produto com slug "${item.productSlug}" não encontrado.`);
        }
        newProducts.set(prod.id, item.quantity);
      }
    }

    // 3) Calcular mudanças de estoque
    const allIds = new Set<string>([
      ...oldProducts.keys(),
      ...newProducts.keys(),
    ]);
    const allProductsFromDb = await tx.product.findMany({
      where: { id: { in: [...allIds] } },
    });
    // productId -> { change, stock, name }
    const stockChanges = new Map<
      string,
      { change: number; stock: number; name: string }
    >();

    for (const prod of allProductsFromDb) {
      const oldQty = oldProducts.get(prod.id) ?? 0;
      const newQty = newProducts.get(prod.id) ?? 0;
      if (oldQty !== newQty) {
        // change = + devolve; - retira
        stockChanges.set(prod.id, {
          change: oldQty - newQty,
          stock: prod.stock,
          name: prod.name,
        });
      }
    }

    // Validar estoque (somente nas retiradas)
    for (const [, data] of stockChanges) {
      const toTake = -data.change;
      if (toTake > 0 && data.stock < toTake) {
        throw new Error(
          `Estoque insuficiente para "${data.name}". Necessário: ${toTake}, Disponível: ${data.stock}`,
        );
      }
    }

    // 4) Aplicar estoque
    await Promise.all(
      [...stockChanges.entries()].map(([productId, data]) =>
        tx.product.update({
          where: { id: productId },
          data: { stock: { increment: data.change } },
        }),
      ),
    );

    // 5) Montar dados de atualização do pedido
    const orderUpdateData: Prisma.OrderUpdateInput = {};
    if (dto.client) orderUpdateData.clientName = dto.client;

    if (dto.products) {
      // recriar relações da tabela intermediária
      const toCreate = [...newProducts.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      orderUpdateData.products = {
        deleteMany: {}, // remove todas as relações antigas
        create: toCreate,
      };
    }

    await tx.order.update({
      where: { id: existingOrder.id },
      data: orderUpdateData,
    });

    // 6) Retornar completo
    return tx.order.findUniqueOrThrow({
      where: { id: existingOrder.id },
      include: { products: { include: { product: true } } },
    });
  });

  return this.mapToEntity(updatedOrderInDb);
}

  async delete(slug: string): Promise<boolean> {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Encontra o pedido e seus itens para saber o que devolver ao estoque.
        const orderToDelete = await tx.order.findUnique({
          where: { slug },
          include: {
            products: true, // Apenas os itens do pedido (ProductsOnOrders)
          },
        });

        if (!orderToDelete) {
          throw new Error("Pedido não encontrado para deleção.");
        }

        // 2. Prepara as operações para devolver os itens ao estoque.
        const updateStockPromises = orderToDelete.products.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity, // Incrementa o estoque
              },
            },
          })
        );

        // Executa todas as atualizações de estoque.
        await Promise.all(updateStockPromises);

        // 3. Deleta os registros da tabela de junção.
        await tx.productsOnOrders.deleteMany({
          where: { orderId: orderToDelete.id },
        });

        // 4. Finalmente, deleta o pedido.
        await tx.order.delete({
          where: { slug },
        });
      });

      return true;
    } catch (error) {
      console.error("Erro ao deletar o pedido:", error);
      return false;
    }
  }

  private mapToEntity(prismaOrder: any): OrderEntity {
    const orderEntity = new OrderEntity();
    orderEntity.id = prismaOrder.id;
    orderEntity.client = prismaOrder.clientName;
    orderEntity.createdAt = prismaOrder.createdAt;
    orderEntity.slug = prismaOrder.slug;

    orderEntity.Products = prismaOrder.products.map((item: any) => {
      const productEntity = new ProductEntity();
      productEntity.id = item.product.id;
      productEntity.name = item.product.name;
      productEntity.price = item.product.price;
      productEntity.stock = item.product.stock;
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
