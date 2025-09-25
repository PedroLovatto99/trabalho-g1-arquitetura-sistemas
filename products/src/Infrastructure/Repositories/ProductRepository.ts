import { prisma } from "../../Data/Db/Configurations/prisma";
import { product as PrismaProduct } from "@prisma/client";
import { IProductRepository } from "../Interfaces/IProductRepository";
import { ProductEntity } from "../../Data/Db/Entities/Product";
import { ProductDto } from "../../Application/Dtos/ProductDto";

export class ProductRepository implements IProductRepository {

  // Função privada para mapear o objeto do Prisma para a sua Entidade
  private mapToEntity(prismaProduct: PrismaProduct): ProductEntity {
    const entity = new ProductEntity();
    entity.id = prismaProduct.id;
    entity.name = prismaProduct.name;
    entity.price = prismaProduct.price;
    entity.stock = prismaProduct.stock;
    return entity;
  }

  async create(data: ProductDto): Promise<ProductEntity> {
    const newProduct = await prisma.product.create({ data });
    return this.mapToEntity(newProduct);
  }

  async findMany(): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany();
    return products.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    return product ? this.mapToEntity(product) : null;
  }

  async update(id: string, data: Partial<ProductDto>): Promise<ProductEntity | null> {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data,
      });
      return this.mapToEntity(updatedProduct);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Em uma arquitetura de microserviços, o serviço de produtos não deve
      // conhecer a tabela de pedidos. A lógica de verificar se um produto
      // pode ser deletado deve ficar na camada de serviço de pedidos.
      // Aqui, simplesmente deletamos o produto.
      await prisma.product.delete({ where: { id } });
      return true;
    } catch (error) {
      // Retorna false se o produto não foi encontrado para deletar
      return false;
    }
  }

  async findManyByIds(ids: string[]): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return products.map(this.mapToEntity);
  }

  async findAvailable(): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0, // gt = "greater than"
        },
      },
    });
    return products.map(this.mapToEntity);
  }


}



  // async findManyByIds(ids: string[]): Promise<ProductEntity[]> {
  //   const products = await prisma.product.findMany({
  //     where: {
  //       id: {
  //         in: ids,
  //       },
  //     },
  //   });

  //   return products.map((product) => ({
  //     ...product,
  //     createdAt: product.createdAt || new Date(),
  //     generateSlug: () => product.slug,
  //   })) as ProductEntity[];
  // }

