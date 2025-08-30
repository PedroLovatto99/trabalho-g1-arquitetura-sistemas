import { Router, Request, Response } from "express";
import { ProductRepository } from "../../Infrastructure/Repositories/ProductRepository";
import { ProductService } from "../../Application/Services/ProductService";

const productService = new ProductService(new ProductRepository());
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

// GET /products
router.get("/products", async (req: Request, res: Response) => {
  try {
    const response = await productService.findAll();
    res.status(200).json(response);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message ?? "Erro ao buscar produtos" });
  }
});

// GET /products/slug
router.get("/products/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug!;
    const response = await productService.findbySlug(slug);
    res.status(200).json(response);
  } catch (error: any) {
    res
      .status(404)
      .json({ message: error.message ?? "Erro ao buscar produto" });
  }
});

// PUT /products/:slug
router.put("/products/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

    const updated = await productService.update(slug, req.body);
    res.status(200).json(updated); 
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao atualizar produto" });
  }
});

// DELETE /products/:slug
router.delete("/products/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

    await productService.delete(slug);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao excluir produto" });
  }
});

export default router;
