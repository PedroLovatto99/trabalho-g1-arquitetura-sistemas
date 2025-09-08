import { Prisma, Client } from "@prisma/client";
import { IClientRepository } from "../Interfaces/IClientRepository";
import {
  CreateClientDto,
  UpdateClientDto,
} from "../../Application/Dtos/ClientDto";
import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";
import { prisma } from "../../Data/Db/Configurations/prisma";

export class ClientRepository implements IClientRepository {
  async create(data: ClientEntity): Promise<ClientEntity> {
    const newClient = await prisma.client.create({
      data: {
        slug: data.slug,
        name: data.name,
        email: data.email,
        isDeleted: false,
      },
    });

    return newClient as unknown as ClientEntity;
  }

  // async findAll(): Promise<Client[]> {
  //   return prisma.client.findMany({ where: { isDeleted: false } });
  // }

  async findBySlug(slug: string): Promise<ClientEntity | null> {
    const client = await prisma.client.findUnique({
      where: { slug: slug },
    });
    return client as unknown as ClientEntity | null;
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const clientData = await prisma.client.findUnique({ where: { email } });

    if (!clientData) {
      return null;
    }

    return new ClientEntity(clientData);
  }

  // async update(id: string, data: UpdateClientDto): Promise<Client | null> {
  //   try {
  //     return await prisma.client.update({ where: { id }, data });
  //   } catch (error) {
  //     return null;
  //   }
  // }

  // // Soft delete: apenas marca o cliente como deletado
  // async delete(id: string): Promise<void> {
  //   await this.update(id, { isDeleted: true });
  // }
}
