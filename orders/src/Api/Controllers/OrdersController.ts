import { Router, Request, Response } from "express";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";
// REMOVIDO: O import da PaymentServiceHttpClient não é mais necessário.
// import { PaymentServiceHttpClient } from "../../External/apiPayments"; 
import { ProductServiceHttpClient } from "../../External/apiProducts";
import mongoose from "mongoose";

// Injeção de Dependência Corrigida
const orderRepository = new OrderRepository();
// REMOVIDO: Não criamos mais a instância do serviço de pagamento.
// const paymentService = new PaymentServiceHttpClient(); 
const productService = new ProductServiceHttpClient();

// CORRIGIDO: O 'paymentService' foi removido da chamada do construtor.
const orderService = new OrderService(orderRepository, productService);

const router = Router();

// POST /api/orders
router.post("/", async (req: Request, res: Response) => {
  try {
    const newOrder = await orderService.create(req.body);
    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;

    if (clientId && typeof clientId === 'string') {
      // Se clientId for fornecido, busca por cliente
      const orders = await orderService.findByClient(clientId);
      return res.status(200).json(orders);
    } else {
      // Se não, lista todos os pedidos
      const orders = await orderService.findAll();
      return res.status(200).json(orders);
    }
  } catch (error: any) {
    console.error(`[GET /orders] Erro:`, error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// GET /api/orders?clientId=...
router.get("/", async (req: Request, res: Response) => {
  try {
    const { clientId } = req.query;
    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ message: "O parâmetro 'clientId' é obrigatório." });
    }
    const orders = await orderService.findByClient(clientId);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});


// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validação para garantir que o ID não seja undefined
    if (!id) {
        return res.status(400).json({ message: "O ID do pedido é obrigatório." });
    }

    // Validação do formato do ID do MongoDB
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "O ID do pedido fornecido tem um formato inválido." });
    }

    const order = await orderService.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    res.status(200).json(order);
  } catch (error: any) {
    console.error(`[GET /orders/:id] Erro:`, error); 
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});


// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "O ID do pedido é obrigatório na URL." });
    }
    const updatedOrder = await orderService.updateStatus(id, req.body);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }

});


export default router;