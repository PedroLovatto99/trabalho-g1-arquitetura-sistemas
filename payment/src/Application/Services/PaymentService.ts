// src/services/PaymentService.ts

// Supondo que estes clientes HTTP e o erro já existam



import { IPaymentRepository } from '../../Infrastucture/Interfaces/IPaymentRepository';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../Dtos/PaymentDtos';
import { IPaymentService } from '../Interfaces/IPaymentService';
import { PaymentStatus } from '@prisma/client'; 
import { OrderServiceHttpClient } from '../../External/api_orders';
import { ProductServiceHttpClient, StockValidationError } from '../../External/api_products';

export class PaymentService implements IPaymentService {
  // ✅ Adicionando as dependências dos outros serviços
  constructor(
    private readonly repo: IPaymentRepository,
    private readonly orderServiceApi: OrderServiceHttpClient,
    private readonly productServiceApi: ProductServiceHttpClient,
  ) {}
  remove(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getOrderBalance(orderId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  /**
   * Passo 1: Cria um registro de pagamento com status inicial 'PENDING'.
   * Este método é chamado logo após a criação de um pedido, por exemplo.
   */
  async create(dto: CreatePaymentDTO) {
    if (dto.amountPaid <= 0) throw new Error("amountPaid must be > 0");
    
    // Adicionamos o status inicial antes de enviar para o repositório
    const paymentData = {
      ...dto,
      status: PaymentStatus.PENDING, 
    };

    console.log(`Criando pagamento para o pedido ${dto.orderId} com status PENDING.`);
    return this.repo.create(paymentData);
  }

  /**
   * Passo 2: Processa um pagamento existente.
   * Este método é chamado por um webhook, um evento, ou uma rota específica.
   */
  async processPayment(paymentId: string) {
    console.log(`Iniciando processamento para o pagamento ${paymentId}...`);
    
    const payment = await this.repo.findById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado.');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(`Pagamento ${paymentId} não está pendente e não pode ser processado.`);
    }

    const { orderId } = payment;

    try {
      // 1. Buscar detalhes do pedido
      const order = await this.orderServiceApi.findById(orderId);
      if (!order) throw new Error(`Pedido ${orderId} associado ao pagamento não foi encontrado.`);

      // 2. Verificar estoque
      await this.productServiceApi.checkStockAvailability(order.products);

      // 3. Dar baixa no estoque
      await Promise.all(
        order.products.map(item =>
          this.productServiceApi.adjustStock(item.productId, -item.quantity)
        )
      );

      // 4. Atualizar status do pedido para 'CONFIRMED'
      await this.orderServiceApi.updateStatus(orderId, PaymentStatus.CONFIRMED);

      // 5. Atualizar status do pagamento para 'COMPLETED'
      console.log(`Pagamento ${paymentId} processado com sucesso.`);
      return this.repo.update({ id: paymentId, status: PaymentStatus.COMPLETED });

    } catch (error) {
      console.error(`Falha ao processar o pagamento ${paymentId}:`, error);

      // Lógica de compensação em caso de falha
      if (error instanceof StockValidationError) {
        await this.orderServiceApi.updateStatus(orderId, PaymentStatus.CANCELED);
      }
      await this.repo.update({ id: paymentId, status: PaymentStatus.FAILED });

      throw error; // Propaga o erro
    }
  }

  // --- Outros métodos CRUD que você já tinha ---
  get(id: string) {
    return this.repo.findById(id);
  }

  list(params?: any) {
    return this.repo.list(params);
  }

  update(dto: UpdatePaymentDTO) {
    if (dto.amountPaid !== undefined && dto.amountPaid <= 0) {
      throw new Error("amountPaid must be > 0");
    }
    return this.repo.update(dto);
  }
  
  // ... e os outros métodos
}