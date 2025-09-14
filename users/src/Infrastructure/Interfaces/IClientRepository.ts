import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";
import { UpdateClientDto } from "../../Application/Dtos/ClientDto";

export interface IClientRepository {
  create(data: { name: string; email: string; slug: string }): Promise<ClientEntity>;
  findMany(): Promise<ClientEntity[]>;
  findById(id: string): Promise<ClientEntity | null>;
  update(id: string, data: UpdateClientDto): Promise<ClientEntity | null>;
}