import { prisma, Client } from "@prisma/client";
import { IClientRepository } from "../Interfaces/IClientRepository";
import { CreateClientDto, UpdateClientDto } from "../../Application/Dtos/ClientDto";

export class ClientRepository implements IClientRepository {
  async create(data: CreateClientDto): Promise<Client> {
    return prisma.client.create({ data });
  }

  async findAll(): Promise<Client[]> {
    return prisma.client.findMany({ where: { isDeleted: false } });
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id, isDeleted: false } });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { email } });
  }

  async update(id: string, data: UpdateClientDto): Promise<Client | null> {
    try {
      return await prisma.client.update({ where: { id }, data });
    } catch (error) {
      return null;
    }
  }

  // Soft delete: apenas marca o cliente como deletado
  async delete(id: string): Promise<void> {
    await this.update(id, { isDeleted: true });
  }
}