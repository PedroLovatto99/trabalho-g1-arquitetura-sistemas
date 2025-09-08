import { Router, Request, Response } from "express";
import { ClientService } from "../../Application/Services/ClientService";
import { ClientRepository } from "../../Infrastructure/Repositories/ClientRepository";
import { OrderService } from "../../Application/Services/OrderService";
import { OrderRepository } from "../../Infrastructure/Repositories/OrderRepository";
import { ProductRepository } from "../../Infrastructure/Repositories/ProductRepository";

const clientRepository = new ClientRepository();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();

const clientService = new ClientService(clientRepository);
const orderService = new OrderService(orderRepository, clientRepository, productRepository);

const clientRouter = Router();

clientRouter.post("/", async (req: Request, res: Response) => {
  try {
    const client = await clientService.create(req.body);
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// clientRouter.get("/", async (req: Request, res: Response) => {
//   try {
//     const clients = await clientService.findAll();
//     res.status(200).json(clients);
//   } catch (error: any) {
//     res.status(500).json({ message: "Erro ao buscar clientes." });
//   }
// });

// clientRouter.get("/:id", async (req: Request, res: Response) => {
//   try {
//     const client = await clientService.findById(req.params.id);
//     if (!client) {
//       return res.status(404).json({ message: "Cliente não encontrado." });
//     }
//     res.status(200).json(client);
//   } catch (error: any) {
//     res.status(500).json({ message: "Erro ao buscar cliente." });
//   }
// });

// clientRouter.get("/:clientId/orders", async (req: Request, res: Response) => {
//   try {
//     const { clientId } = req.params;
//     const orders = await orderService.findOrdersByClient(clientId);
//     res.status(200).json(orders);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// });

// clientRouter.put("/:id", async (req: Request, res: Response) => {
//   try {
//     const updatedClient = await clientService.update(req.params.id, req.body);
//     if (!updatedClient) {
//       return res.status(4404).json({ message: "Cliente não encontrado." });
//     }
//     res.status(200).json(updatedClient);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// });

// clientRouter.delete("/:id", async (req: Request, res: Response) => {
//   try {
//     await clientService.delete(req.params.id);
//     res.status(204).send();
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// });

export default clientRouter;