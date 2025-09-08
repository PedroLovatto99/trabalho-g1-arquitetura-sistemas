import { CreateClientDto, UpdateClientDto, ClientResponseDto } from "../Dtos/ClientDto";

export interface IClientService {
  create(dto: CreateClientDto): Promise<ClientResponseDto>;
  // findAll(): Promise<ClientResponseDto[]>;
  // findById(id: string): Promise<ClientResponseDto | null>;
  // update(id: string, dto: UpdateClientDto): Promise<ClientResponseDto | null>;
  // delete(id: string): Promise<void>;
}