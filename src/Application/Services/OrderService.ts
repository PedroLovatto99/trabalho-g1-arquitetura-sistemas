import { OrderEntity } from "../../Data/Db/Entities/Orders";
import type { IOrderRepository } from "../../Infrastructure/Interfaces/IorderRepository";
import type { OrderDTO } from "../Dtos/OrdersDto";
import type { IOrderService } from "../Interfaces/IOrdersService";
import { ProductEntity } from "../../Data/Db/Entities/Product";

export class OrderService implements IOrderService {
  constructor(private repo: IOrderRepository) {}

  async create(dto: OrderDTO): Promise<OrderDTO> {
    if (!dto.client || dto.client.trim().length < 3)
      throw new Error("Nome do cliente precisa ter mais que 3 caracteres");

      if (dto.Products) {
      dto.Products.forEach((p) => {
        if (p.stock < 1) {
          throw new Error(`Produto ${p.name} não possui estoque suficiente`);
        }
      });
    }

    const order = new OrderEntity();
    order.client = dto.client;
    order.Products = dto.Products?.map((p) => {
      const product = new ProductEntity();
      product.Name = p.name;
      product.Price = p.price;
      product.Stock = p.stock;
      return product;
    }) || [];

    const createdOrder = await this.repo.create(order);

    return {
      client: createdOrder.client,
      Products: createdOrder.Products.map((p) => ({
        name: p.Name,
        price: p.Price,
        stock: p.Stock,
      })),
    };
  }

  async findAll(): Promise<OrderDTO[]> {
    const orders = await this.repo.findMany();

    if (!orders || orders.length === 0) {
      return [];
    }

    return orders.map((o) => ({
      client: o.client,
      Products: o.Products.map((p) => ({
        name: p.Name,
        price: p.Price,
        stock: p.Stock,
      })),
    }));
  }

  async findbySlug(slug: string): Promise<OrderDTO> {
    const order = await this.repo.findBySlug(slug);

    if (!order) {
      throw new Error("Nenhum pedido encontrado");
    }

    return {
      client: order.client,
      Products: order.Products.map((p) => ({
        name: p.Name,
        price: p.Price,
        stock: p.Stock,
      })),
    };
  }

async update(
    slug: string,
    dto: Partial<OrderDTO>
  ): Promise<OrderDTO> {
    const patch: Partial<OrderEntity> = {};
    if (dto.client !== undefined) patch.client = dto.client;
    if (dto.Products !== undefined) {
      patch.Products = dto.Products.map((p) => {
        const product = new ProductEntity();
        product.Name = p.name;
        product.Price = p.price;
        product.Stock = p.stock;

        return product;
      });
    }

    const updated = await this.repo.updateBySlug(slug, patch);
    if (!updated) throw new Error("Pedido não encontrado");

    return {
      client: updated.client,
      Products: updated.Products.map((p) => ({
        name: p.Name,
        price: p.Price,
        stock: p.Stock,
      })),
    };
  }

  async delete(slug: string): Promise<void> {
    const current = await this.repo.findBySlug(slug);
    if (!current) throw new Error("Pedido não encontrado");

    await this.repo.delete(slug);
  }
}