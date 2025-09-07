import { IClientRepository } from "../../Infrastructure/Interfaces/IClientRepository";
import { CreateClientDto, ClientResponseDto, UpdateClientDto } from "../Dtos/ClientDto";
import { IClientService } from "../Interfaces/IClientService";
import type { Client } from "@prisma/client";

export class ClientService implements IClientService {
  constructor(private repo: IClientRepository) {}

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    if (!dto.name || dto.name.trim().length < 3) {
      throw new Error("Nome do cliente é obrigatório.");
    }
    if (!dto.email || !/^\S+@\S+\.\S+$/.test(dto.email)) {
      throw new Error("Email inválido.");
    }

    const existingClient = await this.repo.findByEmail(dto.email);
    if (existingClient) {
      throw new Error("Já existe um cliente com este email.");
    }

    const newClient = await this.repo.create(dto);
    return this.mapToDto(newClient);
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.repo.findAll();
    return clients.map(this.mapToDto);
  }

  async findById(id: string): Promise<ClientResponseDto | null> {
    const client = await this.repo.findById(id);
    return client ? this.mapToDto(client) : null;
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientResponseDto | null> {
    const updatedClient = await this.repo.update(id, dto);
    return updatedClient ? this.mapToDto(updatedClient) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private mapToDto(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      isDeleted: client.isDeleted,
    };
  }
}