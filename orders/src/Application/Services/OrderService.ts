import { paymentsApi } from "../../External/api";
import { IPaymentApi } from "../../External/apiPayments";
import { IProductApi } from "../../External/apiProducts";
import {
  FullOrder,
  IOrderRepository,
} from "../../Infrastructure/Interfaces/IorderRepository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../Dtos/OrdersDto";
import { IOrderService } from "../Interfaces/IOrdersService";
import { ProductItem } from "@prisma/client";
import { producer, TOPIC_NAME } from '../../index';
import redisClient from "../../redis/redits";


export class OrderService implements IOrderService {
  // A dependência do productApi foi removida do construtor
  constructor(
    private orderRepo: IOrderRepository,
    private productsServiceApi: IProductApi
  ) {}

  async create(dto: CreateOrderDTO): Promise<FullOrder> {
    if (!dto.clientId) throw new Error("ID do cliente é obrigatório.");
    if (!Array.isArray(dto.products) || dto.products.length === 0) {
      throw new Error("O pedido precisa de produtos.");
    }

    const qtyById = new Map<string, number>();
    dto.products.forEach(p => qtyById.set(p.productId, (qtyById.get(p.productId) ?? 0) + p.quantity));

    const uniqueIds = [...qtyById.keys()];
    const productsFromService = await this.productsServiceApi.findManyByIds(uniqueIds);
    if (productsFromService.length !== uniqueIds.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    const productItems: ProductItem[] = productsFromService.map((sp) => ({
      productId: sp.id,
      productName: sp.name,
      unitPrice: Number(sp.price),
      quantity: qtyById.get(sp.id)!,
    }));

    const total = productItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

    const createdOrder = await this.orderRepo.create({
        clientId: dto.clientId,
        total: total,
        products: productItems,
        status: 'PENDING_PAYMENT',
    });

    // AGORA, APENAS A LÓGICA DO KAFKA SERÁ EXECUTADA:
      try {
        // CORRIGIDO: Convertendo o ObjectId para string antes de usá-lo.
        const orderIdString = createdOrder._id.toString();

        const kafkaMessagePayload = {
            id_order: orderIdString, // Usa a string
            id_client: createdOrder.clientId,
            products: createdOrder.products.map(p => ({
                id_product: p.productId,
                value: p.unitPrice,
                quantity: p.quantity,
            })),
            date: createdOrder.createdAt,
            total_value: createdOrder.total,
            met_pag: dto.typePaymentIds,
            valor: createdOrder.total,
        };

        await producer.send({
            topic: TOPIC_NAME,
            messages: [{ 
                key: orderIdString, // Usa a string
                value: JSON.stringify(kafkaMessagePayload) 
            }],
        });

        console.log(`[KAFKA] Evento do pedido [${orderIdString}] enviado para o tópico '${TOPIC_NAME}'.`);

    } catch (error) {
        console.error(`[KAFKA] FALHA ao enviar evento para o pedido ${createdOrder._id.toString()}. Revertendo...`, error);
        await this.orderRepo.remove(createdOrder._id.toString());
        throw new Error('Falha ao processar o pedido. Por favor, tente novamente.');
    }

    return createdOrder;
  }

  async findById(id: string): Promise<FullOrder | null> {
    const cacheKey = `order:${id}`;
    
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return JSON.parse(cachedOrder);
    }

    console.log(`[Cache] MISS: ${cacheKey}`);
    // 3. Corrigido para usar 'this.orderRepo', conforme definido no construtor
    const order = await this.orderRepo.findById(id);

    // Salva no cache com TTL de 30 dias (2592000 segundos)
    if (order) {
      await redisClient.set(cacheKey, JSON.stringify(order), { EX: 2592000 });
    }

    return order;
  }

    async findAll(): Promise<FullOrder[]> {
    return this.orderRepo.findAll();
  }

  async findByClient(clientId: string): Promise<FullOrder[]> {
    return this.orderRepo.findByClientId(clientId);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDTO
  ): Promise<FullOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Pedido não encontrado.");

    // A lógica de verificação e baixa de estoque foi removida.
    // O método agora apenas atualiza o status do pedido.

    const updatedOrder = await this.orderRepo.updateStatus(id, dto.status);
    if (!updatedOrder)
      throw new Error("Falha ao atualizar o status do pedido.");

    return updatedOrder;
  }
}
