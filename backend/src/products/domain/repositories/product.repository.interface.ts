import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findAvailable(): Promise<Product[]>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(id: string, quantity: number): Promise<Product>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
