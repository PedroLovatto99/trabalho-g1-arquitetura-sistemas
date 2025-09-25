import { Router, Request, Response } from "express";
import { ProductService } from "../../Application/Services/ProductService";
import { ProductRepository } from "../../Infrastructure/Repositories/ProductRepository";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

const router = Router();

// POST /api/products
router.post("/", async (req: Request, res: Response) => {
  try {
    const newProduct = await productService.create(req.body);
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/products
// Suporta buscar apenas em estoque: ?inStock=true
router.get("/", async (req: Request, res: Response) => {
  try {
    const { ids, inStock } = req.query;

    if (inStock === 'true') {
      const products = await productService.findAvailable();
      return res.status(200).json(products);
    }

    const products = await productService.findAll();
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID do produto é necessário" });
    }
    const product = await productService.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.status(200).json(product);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const updated = await productService.update(id, req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    await productService.delete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// PATCH /api/products/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "o id do produto é necessário" });
    }

    // O método 'update' já foi projetado para lidar com atualizações parciais.
    // Ele aceita um objeto com qualquer um dos campos do produto.
    const updatedProduct = await productService.update(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {

    res.status(400).json({ message: error.message });
  }
});


//PATCH /api/products/:id/stock

router.patch("/:id/stock", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // Espera um corpo como: { "quantity": -10 }

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: "Quantity must be a number" });
    }

    const updatedProduct = await productService.adjustStock(id, quantity);
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    // Pode ser erro de "Produto não encontrado" ou "Estoque insuficiente"
    res.status(400).json({ message: error.message });
  }
});




export default router;