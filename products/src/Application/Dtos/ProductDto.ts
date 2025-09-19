export interface ProductDto {
    id: string;
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