import { Product } from './domain/entities/product.entity';
import { CreateProductDto } from './application/dto/create-product.dto';
import { UpdateProductDto } from './application/dto/update-product.dto';

export const mockProduct: Product = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Product',
  description: 'A test product',
  price: 100000,
  stock: 10,
  imageUrl: 'https://example.com/image.jpg',
  category: 'electronics',
  isActive: true,
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockCreateProductDto: CreateProductDto = {
  name: 'New Product',
  description: 'New product description',
  price: 50000,
  stock: 5,
  category: 'electronics',
};

export const mockUpdateProductDto: UpdateProductDto = {
  name: 'Updated Product',
  price: 90000,
};
