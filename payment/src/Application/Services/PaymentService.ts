import { TypePaymentEntity } from "../../Data/Db/Entities/TypePaymentEntity";
import { IOrderApi } from "../../External/apiOrders";
import { IProductApi } from "../../External/apiProducts";
import { IPaymentRepository } from "../../Infrastucture/Interfaces/IPaymentRepository";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../Dtos/PaymentDtos";
import { IPaymentService } from "../Interfaces/IPaymentService";
import { notificationAPI } from "../../External/api";
import type { Status } from "@prisma/client";
import { sendPaymentNotification } from "../rabbitmq/notification_producer"; 
import { UserApi } from "../../External/apiUsers";

export class PaymentService implements IPaymentService {

  private readonly userApi: UserApi;

  constructor(
    private readonly repo: IPaymentRepository,
    private readonly orderApi: IOrderApi,
    private readonly productApi: IProductApi
  ) {
    this.userApi = new UserApi();
  }

  async create(dto: CreatePaymentDTO) {
    if (dto.amountPaid <= 0) throw new Error("amountPaid must be > 0");
    if (!dto.typePaymentIds?.length) {
      throw new Error("Ao menos um tipo de pagamento deve ser informado");
    }

    // Adicionamos o status inicial antes de enviar para o repositório
    const paymentData = {
      ...dto,
    };

    console.log(
      `Criando pagamento para o pedido ${dto.orderId} com status PENDING.`
    );
    return this.repo.create(paymentData);
  }

  

  async processPayment(
    paymentId: string
  ): Promise<{ paymentId: string; status: string; orderId?: string;  }> {
    const payment = await this.get(paymentId);

    if (!payment) {
      throw new Error("Pagamento não encontrado");
    }

    const order = await this.orderApi.getOrder(payment.orderId);
    console.log("🚀 ~ PaymentService ~ processPayment ~ order:", order)

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    const productIds = order.products.map((p) => p.productId);
    const productsFromService = await this.productApi.findManyByIds(productIds);

    if (productsFromService.length !== productIds.length) {
      throw new Error("Um ou mais produtos não foram encontrados.");
    }

    // Passo 1: Validar o estoque para TODOS os produtos do pedido
    order.products.forEach((orderProduct) => {
      // Encontra o produto correspondente que veio do serviço
      const productInStock = productsFromService.find(
        (p) => p.id === orderProduct.productId
      );

      // Se não encontrar o produto (já validado antes, mas bom garantir) ou se o estoque for insuficiente
      if (!productInStock || productInStock.stock < orderProduct.quantity) {
        throw new Error(
          `Estoque insuficiente para o produto ${
            productInStock?.name || orderProduct.productId
          }.`
        );
      }
    });

    // Passo 2: Se todas as validações passaram, prossiga para diminuir o estoque
    console.log("Estoque validado com sucesso. Ajustando...");
    await Promise.all(
      order.products.map((orderProduct) => {
        // 1. Encontra o produto novamente para pegar o estoque atual
        const productInStock = productsFromService.find(
          (p) => p.id === orderProduct.productId
        )!; // Usamos '!' pois a existência do produto já foi garantida no loop anterior

        // 2. Calcula o novo nível do estoque
        const newStockLevel = productInStock.stock - orderProduct.quantity;

        // 3. Envia o NOVO TOTAL do estoque para a API
        return this.productApi.adjustStock(
          orderProduct.productId,
          newStockLevel
        );
      })
    );

    const approved = Math.random() > 0.5;
    const newStatus = approved ? "2" : "3";

    console.log("🚀 ~ PaymentService ~ processPayment ~ order:", order)
    await this.orderApi.updateStatus(order._id, { status: newStatus });
    await this.repo.update({
      id: paymentId,
      statusId: Number(newStatus),
      paidAt: approved ? new Date() : null,
    });

    // Colocar producer aqui, no lugar dessa chamada api
    if (approved) {
      // Corrigido: Agora `this.userApi` existe e pode ser chamado
      const user = await this.userApi.getUser(order.clientId); 
      if (user) {
        await sendPaymentNotification({
          orderId: order._id,
          userName: user.name,
        });
      } else {
        console.error(`Could not find user with id ${order.clientId} for notification.`);
      }
    }

    // Corrigido: Removemos a propriedade de notificação, pois ela não existe mais.
    return { paymentId, status: newStatus, orderId: payment?.orderId ?? "" };
  }

  async get(id: string) {
    return await this.repo.findById(id);
  }

  list(params?: {
    orderId?: string;
    typePaymentId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.repo.list(params);
  }

  update(dto: UpdatePaymentDTO) {
    if (dto.amountPaid !== undefined && dto.amountPaid <= 0) {
      throw new Error("amountPaid must be > 0");
    }
    return this.repo.update(dto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async getOrderBalance(orderId: string) {
    return this.repo.sumByOrder(orderId);
  }

  async listPaymentsByOrder(orderId: string) {
    if (!orderId) {
      throw new Error("OrderId é obrigatório");
    }
    return this.repo.listByOrder(orderId);
  }


}
