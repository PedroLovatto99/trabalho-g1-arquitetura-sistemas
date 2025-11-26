import { CreateClientDto, UpdateClientDto } from "../Dtos/ClientDto";
import { IClientRepository } from "../../Infrastructure/Interfaces/IClientRepository";
import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";
import redisClient from "../../redis/redits";

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
    const cacheKey = `user:${id}`;
    
    // Tenta buscar do cache primeiro
    const cachedClient = await redisClient.get(cacheKey);
    if (cachedClient) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return JSON.parse(cachedClient);
    }

    // Se não encontrar, busca no banco
    console.log(`[Cache] MISS: ${cacheKey}`);
    const client = await this.clientRepository.findById(id);

    // Salva no cache com TTL de 1 dia (86400 segundos) antes de retornar
    if (client) {
      await redisClient.set(cacheKey, JSON.stringify(client), { EX: 86400 });
    }

    return client;
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