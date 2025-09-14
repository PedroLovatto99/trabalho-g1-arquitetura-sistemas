export interface CreateClientDto {
  name: string;
  email: string;
}


export interface UpdateClientDto {
  name?: string;
  email?: string;
  isDeleted?: boolean;
}


export interface ClientResponseDto {
  id: string;
  name: string;
  email: string;
  isDeleted: boolean;
}