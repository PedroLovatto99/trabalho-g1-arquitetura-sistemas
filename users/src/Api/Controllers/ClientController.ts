import { Router, Request, Response } from "express";
import { ClientService } from "../../Application/Services/ClientService";
import { ClientRepository } from "../../Infrastructure/Repositories/ClientRepository";

const clientRepository = new ClientRepository();
const clientService = new ClientService(clientRepository);

const router = Router();

// POST /api/clients CRIAR
router.post("/", async (req: Request, res: Response) => {
  try {
    const clientDto = req.body;
    const newClient = await clientService.create(clientDto);
    res.status(201).json(newClient);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/clients LISTAR
router.get("/", async (_req: Request, res: Response) => {
  try {
    const clients = await clientService.findAll();
    res.status(200).json(clients);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/clients/:id BUSCAR POR ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // CORREÇÃO 1: Verifica se o ID foi fornecido
    if (!id) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const client = await clientService.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/clients/:id ATUALIZAR
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientDto = req.body;

    // CORREÇÃO 1: Verifica se o ID foi fornecido
    if (!id) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const updatedClient = await clientService.update(id, clientDto);

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(updatedClient);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/clients/:id DELETAR
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // CORREÇÃO 1: Verifica se o ID foi fornecido
    if (!id) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // CORREÇÃO 2: Lógica ajustada. Se der erro, o catch pega.
    await clientService.delete(id);

    res.status(204).send();
  } catch (error: any) {
    // Se o serviço lançar um erro de "não encontrado", ele cairá aqui
    res.status(404).json({ message: error.message ?? "Client not found" });
  }
});

export default router;