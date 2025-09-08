import { Router, Request, Response } from "express";
import { ProductRepository } from "../../Infrastructure/Repositories/ProductRepository";
import { ProductService } from "../../Application/Services/ProductService";


const productService = new ProductService(new ProductRepository());
const router = Router();

// POST /products
router.post("/", async (req: Request, res: Response) => {
  try {
    const created = await productService.create(req.body);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao criar produto" });
  }
});

// GET /products
router.get("/", async (req: Request, res: Response) => {
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
router.get("/:slug", async (req: Request, res: Response) => {
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
router.put("/:slug", async (req: Request, res: Response) => {
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
router.delete("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: "Slug é obrigatório" });

    const response = await productService.delete(slug);
    if(response === false){
      return res.status(400).json({ message: "Não foi possível excluir o produto. Ele pode estar associado a pedidos." });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Erro ao excluir produto" });
  }
});

router.put("/:slug", async (req: Request, res: Response) => {
    try {
        const slug = req.params!;
        const updatedProduct = await productService.update(slug, req.body);
        res.status(200).json(updatedProduct);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});


// Nova rota para ajustar o estoque
// router.patch("/:slug/stock", async (req: Request, res: Response) => {
//     try {
//         const { slug } = req.params;
//         const updatedProduct = await productService.adjustStock(slug, req.body);
//         res.status(200).json(updatedProduct);
//     } catch (error: any) {
//         res.status(400).json({ message: error.message });
//     }
// });


export default router;
