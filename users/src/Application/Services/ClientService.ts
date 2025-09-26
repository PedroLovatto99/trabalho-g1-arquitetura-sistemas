import { CreateClientDto, UpdateClientDto } from "../Dtos/ClientDto";
import { IClientRepository } from "../../Infrastructure/Interfaces/IClientRepository";
import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";

export class ClientService { 
  constructor(private readonly clientRepository: IClientRepository) {}

  async create(dto: CreateClientDto): Promise<ClientEntity> {
    const dataToSave = { ...dto };
    return this.clientRepository.create(dataToSave);
  }

  async findAll(): Promise<ClientEntity[]> {
    return this.clientRepository.findMany();
  }

  async findById(id: string): Promise<ClientEntity | null> {
    return this.clientRepository.findById(id);
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientEntity | null> {
    return this.clientRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error("Client not found");
    }
    await this.clientRepository.update(id, { isDeleted: true });
  }
}