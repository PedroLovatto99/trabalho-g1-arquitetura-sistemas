// src/http/payment.routes.ts
import { Router, Request, Response } from "express";
import { IPaymentService } from "../../Application/Interfaces/IPaymentService";
import {
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "../../Application/Dtos/PaymentDtos";
import { PaymentService } from "../../Application/Services/PaymentService";
import { PaymentRepository } from "../../Infrastucture/Repositories/PaymentRepository";
import { OrdersServiceHttpClient } from "../../External/apiOrders";
import { ProductServiceHttpClient } from "../../External/apiProducts";
import { Prisma, PrismaClient } from "@prisma/client";

// você injeta a implementação concreta aqui
const paymentService = new PaymentService(new PaymentRepository(new PrismaClient()), new OrdersServiceHttpClient(), new ProductServiceHttpClient())


const router = Router();

// POST /api/payments
router.post("/", async (req: Request, res: Response) => {
  try {
    const dto = req.body as CreatePaymentDTO;
    const created = await paymentService.create(dto);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// POST Processar POST
router.post(
  "/process/:paymentId",
  async (req: Request<{ paymentId: string }>, res: Response) => {
    try {
      const paymentId = req.params.paymentId; // agora é string
      const created = await paymentService.processPayment(paymentId);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// GET /api/payments
router.get("/", async (req: Request, res: Response) => {
  try {
    const { orderId, typePaymentId } = req.query as {
      orderId?: string;
      typePaymentId?: string;
    };

    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "20"), 10);

    const params: {
      orderId?: string;
      typePaymentId?: string;
      page: number;
      pageSize: number;
    } = {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize:
        Number.isFinite(pageSize) && pageSize > 0
          ? Math.min(pageSize, 200)
          : 20,
    };
    if (orderId !== undefined) params.orderId = orderId;
    if (typePaymentId !== undefined) params.typePaymentId = typePaymentId;

    const result = await paymentService.list(params);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message ?? "Internal server error" });
  }
});

// GET /api/payments/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id é obrigatório" });

    const found = await paymentService.get(id);
    if (!found)
      return res.status(404).json({ message: "Pagamento não encontrado" });

    res.status(200).json(found);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/payments/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id é obrigatório" });

    const dto: UpdatePaymentDTO = { id, ...req.body };
    const updated = await paymentService.update(dto);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/payments/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id é obrigatório" });

    const dto: UpdatePaymentDTO = { id, ...req.body };
    const updated = await paymentService.update(dto);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/payments/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id é obrigatório" });

    await paymentService.remove(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/payments/order/:orderId/balance
// router.patch("/:orderId", async (req: Request, res: Response) => {
//   try {
//     const { orderId } = req.params
//     if (!orderId) return res.status(400).json({ message: "orderId é obrigatório" })

//     const total = await paymentService.updateStock(orderId)
//     res.status(200).json({ orderId, total })
//   } catch (error: any) {
//     res.status(400).json({ message: error.message })
//   }
// })

export default router;
