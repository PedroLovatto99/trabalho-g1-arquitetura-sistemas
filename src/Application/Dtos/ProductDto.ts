export interface ProductResponseDto {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
}

export interface AdjustStockDto {
  quantity: number;
}