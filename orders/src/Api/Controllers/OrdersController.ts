import { Router, Request, Response } from "express";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";

const orderService = new OrderService(new OrderRepository());
const router = Router();

// POST /orders
router.post("/", async (req: Request, res: Response) => {
  try {
    const created = await orderService.create(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao criar pedido" });
  }
});

// GET /orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await orderService.findAll();
    res.status(200).json(response);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message ?? "Erro ao buscar pedidos" });
  }
});

// GET /orders/slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug!;
    const response = await orderService.findbySlug(slug);
    res.status(200).json(response);
  } catch (error: any) {
    res
      .status(404)
      .json({ message: error.message ?? "Erro ao buscar o pedido" });
  }
});

// PUT /orders/:slug
router.put("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

    const updated = await orderService.update(slug, req.body);
    res.status(200).json(updated); 
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao atualizar pedido" });
  }
});

//DELETE /products/:slug
router.delete("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

    await orderService.delete(slug);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao excluir produto" });
  }
});

export default router;
