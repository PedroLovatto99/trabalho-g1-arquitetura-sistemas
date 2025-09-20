import { prisma } from "../../Data/Db/Configurations/prisma";
import { Client as PrismaClient } from "@prisma/client";
import { IClientRepository } from "../Interfaces/IClientRepository";
import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";
import { UpdateClientDto } from "../../Application/Dtos/ClientDto";

export class ClientRepository implements IClientRepository {

  private mapToEntity(prismaClient: PrismaClient): ClientEntity {
    const entity = new ClientEntity();
    entity.id = prismaClient.id;
    entity.name = prismaClient.name;
    entity.email = prismaClient.email;
    entity.isDeleted = prismaClient.isDeleted;
    return entity;
  }

  async create(data: { name: string; email: string; }): Promise<ClientEntity> {
    const newClient = await prisma.client.create({ data });
    return this.mapToEntity(newClient);
  }

  async findMany(): Promise<ClientEntity[]> {
    const clients = await prisma.client.findMany({ where: { isDeleted: false } });
    return clients.map(this.mapToEntity);
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const client = await prisma.client.findUnique({ where: { id, isDeleted: false } });
    return client ? this.mapToEntity(client) : null;
  }

  async update(id: string, data: UpdateClientDto): Promise<ClientEntity | null> {
    try {
      const updatedClient = await prisma.client.update({ where: { id }, data });
      return this.mapToEntity(updatedClient);
    } catch (error) {
      return null;
    }
  }
}