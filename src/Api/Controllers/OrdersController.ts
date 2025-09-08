import { Router, Request, Response } from "express";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";
import { ClientRepository } from "../../Infrastructure/Repositories/ClientRepository";
import { ProductRepository } from "../../Infrastructure/Repositories/ProductRepository";

const orderRepository = new OrderRepository();
const clientRepository = new ClientRepository();
const productRepository = new ProductRepository();

// 2. Passe as três instâncias para o construtor do OrderService.
const orderService = new OrderService(
  orderRepository,
  clientRepository,
  productRepository
);
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

// POST /orders
router.post("/payment/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug!;
    const created = await orderService.confirmPayment(slug, req.body);
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
// router.put("/:slug", async (req: Request, res: Response) => {
//   try {
//     const slug = req.params.slug!;
//     if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

//     const updated = await orderService(slug, req.body);
//     res.status(200).json(updated);
//   } catch (error: any) {
//     res
//       .status(400)
//       .json({ message: error.message ?? "Erro ao atualizar pedido" });
//   }
// });

// //DELETE /products/:slug
// router.delete("/:slug", async (req: Request, res: Response) => {
//   try {
//     const slug = req.params.slug;
//     if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

//     await orderService.delete(slug);
//     res.status(204).send();
//   } catch (error: any) {
//     res
//       .status(400)
//       .json({ message: error.message ?? "Erro ao excluir produto" });
//   }
// });

export default router;
