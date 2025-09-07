import type { Client } from "@prisma/client";
import type { CreateClientDto, UpdateClientDto } from "../../Application/Dtos/ClientDto";

export interface IClientRepository {
  create(data: CreateClientDto): Promise<Client>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  update(id: string, data: UpdateClientDto): Promise<Client | null>;
  delete(id: string): Promise<void>;
}