import { prisma } from "../../Data/Db/Configurations/prisma";
import type { ProductEntity } from "../../Data/Db/Entities/Product";
import type { IProductRepository } from "../Interfaces/IProductRepository";

export class ProductRepository implements IProductRepository {
  async create(productData: ProductEntity): Promise<ProductEntity> {
    const newProduct = await prisma.product.create({
      data: {
        name: productData.Name,
        slug: productData.slug,
        price: productData.Price,
        stock: productData.Stock,
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

    if (patch.Name !== undefined) {
      dataToUpdate.name = patch.Name;
    }
    if (patch.slug !== undefined) {
      dataToUpdate.slug = patch.slug;
    }
    if (patch.Price !== undefined) {
      dataToUpdate.price = patch.Price;
    }
    if (patch.Stock !== undefined) {
      dataToUpdate.stock = patch.Stock;
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
      await prisma.product.delete({
        where: { slug: slug },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
