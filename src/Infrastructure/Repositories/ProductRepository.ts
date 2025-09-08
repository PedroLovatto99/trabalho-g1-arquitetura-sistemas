import { prisma } from "../../Data/Db/Configurations/prisma";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import type { IProductRepository } from "../Interfaces/IProductRepository";

export class ProductRepository implements IProductRepository {
  findManyByIds(ids: string[]): Promise<ProductEntity[]> {
    throw new Error("Method not implemented.");
  }
  async create(productData: ProductEntity): Promise<ProductEntity> {
    const newProduct = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        price: productData.price,
        stock: productData.stock,
      },
    });

    return newProduct as unknown as ProductEntity;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await prisma.product.findUnique({
      where: { slug: slug },
    });
    return product as unknown as ProductEntity | null;
  }

  async findMany(): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany();
    return products as unknown as ProductEntity[];
  }

  async updateBySlug(
    slug: string,
    patch: Partial<ProductEntity>
  ): Promise<ProductEntity | null> {
    const dataToUpdate: {
      name?: string;
      slug?: string;
      price?: number;
      stock?: number;
    } = {};

    if (patch.name !== undefined) {
      dataToUpdate.name = patch.name;
    }
    if (patch.slug !== undefined) {
      dataToUpdate.slug = patch.slug;
    }
    if (patch.price !== undefined) {
      dataToUpdate.price = patch.price;
    }
    if (patch.stock !== undefined) {
      dataToUpdate.stock = patch.stock;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return this.findBySlug(slug);
    }

    try {
      const updatedProduct = await prisma.product.update({
        where: { slug: slug },
        data: dataToUpdate,
      });
      return updatedProduct as unknown as ProductEntity;
    } catch (error) {
      return null;
    }
  }

  async delete(slug: string): Promise<boolean> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: slug },
        select: { id: true },
      });

      if (!product) {
        // Produto nem existe, então não há o que deletar
        return false;
      }

      // Passo 2: Contar quantos pedidos estão associados a este produto
      const orderCount = await prisma.order.count({
        where: {
          products: {
            some: {
              productId: product.id,
            },
          },
        },
      });

      if (orderCount > 0) {
        console.error(
          `Tentativa de deletar produto ${slug} que possui ${orderCount} pedidos.`
        );
        return false;
      }

      await prisma.product.delete({
        where: { slug: slug },
      });

      return true;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      return false;
    }
  }

  async findManyBySlugs(slugs: string[]): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({
      where: {
        slug: {
          in: slugs,
        },
      },
    });

    return products.map((productData) => new ProductEntity(productData));
  }
}
