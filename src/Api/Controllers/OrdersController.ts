import { Router, Request, Response } from "express";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";

const orderService = new OrderService(new OrderRepository());
const router = Router();

// POST /orders
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const created = await orderService.create(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao criar pedido" });
  }
});

// GET /orders
router.get("/orders", async (req: Request, res: Response) => {
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
router.get("/orders/:slug", async (req: Request, res: Response) => {
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

// // PUT /orders/:slug
// router.put("/orders/:slug", async (req: Request, res: Response) => {
//   try {
//     const slug = req.params.slug;
//     if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

//     const updated = await orderService.update(slug, req.body);
//     res.status(200).json(updated); 
//   } catch (error: any) {
//     res.status(400).json({ message: error.message ?? "Erro ao atualizar pedido" });
//   }
// });

// DELETE /products/:slug
// router.delete("/pedidos/:slug", async (req: Request, res: Response) => {
//   try {
//     const slug = req.params.slug;
//     if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

//     await orderService.delete(slug);
//     res.status(204).send();
//   } catch (error: any) {
//     res.status(400).json({ message: error.message ?? "Erro ao excluir produto" });
//   }
// });

export default router;
