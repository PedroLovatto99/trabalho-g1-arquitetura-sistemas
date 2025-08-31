import { prisma } from "../../Data/Db/Configurations/prisma";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import type { IProductRepository } from "../Interfaces/IProductRepository";
import { Product as PrismaProduct } from '@prisma/client';

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

    return this.mapToEntity(newProduct);
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await prisma.product.findUnique({
      where: { slug: slug },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findMany(): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany();
     return products.map(p => this.mapToEntity(p));
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
      return this.mapToEntity(updatedProduct);
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

  private mapToEntity(prismaProduct: PrismaProduct): ProductEntity {
    const entity = new ProductEntity();
    entity.id = prismaProduct.id;
    entity.Name = prismaProduct.name;
    entity.Price = prismaProduct.price;
    entity.Stock = prismaProduct.stock;
    entity.slug = prismaProduct.slug;
    return entity;
  }
}
