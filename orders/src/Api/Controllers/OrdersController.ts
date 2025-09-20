import { Router, Request, Response } from "express";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";
import { ProductApi } from "../../Infrastructure/communications/api_products";

// Injeção de Dependência
const orderRepository = new OrderRepository();
const productApi = new ProductApi();
const orderService = new OrderService(orderRepository, productApi);

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
    // Adicionada verificação para garantir que o ID existe
    if (!id) {
      return res.status(400).json({ message: "O ID do pedido é obrigatório na URL." });
    }
    const order = await orderService.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Adicionada verificação para garantir que o ID existe
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