import type {
  CreateClientDto,
  UpdateClientDto,
} from "../../Application/Dtos/ClientDto";
import { ClientEntity } from "../../Data/Db/Entities/ClientEntity";

export interface IClientRepository {
  create(data: ClientEntity): Promise<ClientEntity>;
  // findAll(): Promise<ClienteEntity[]>;
  findBySlug(slug: string): Promise<ClientEntity | null>;
  findByEmail(email: string): Promise<ClientEntity | null>;
  // update(id: string, data: UpdateClientDto): Promise<ClienteEntity | null>;
  // delete(id: string): Promise<void>;
}
