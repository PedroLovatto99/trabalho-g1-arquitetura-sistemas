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
  slug: string;
  name: string;
  email: string;
  isDeleted: boolean;
}