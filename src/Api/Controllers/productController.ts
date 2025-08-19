import { Router, Request, Response } from "express";
import { ProductService } from "../../Application/Services/ProductService";
import { ProductRepositoryMemory } from "../../Infrastructure/Repositories/ProductRepositoryMemory";

const productService = new ProductService(new ProductRepositoryMemory());
const router = Router();

// POST /products
router.post("/products", async (req: Request, res: Response) => {
  try {
    const created = await productService.create(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao criar produto" });
  }
});

export default router;
