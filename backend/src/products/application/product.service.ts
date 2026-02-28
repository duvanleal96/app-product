import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductRepository } from '../domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product.repository.interface';
import { Product } from '../domain/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }

  async findAvailable(): Promise<Product[]> {
    return this.productRepository.findAvailable();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productRepository.create(createProductDto);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findById(id); // Verify exists
    return this.productRepository.update(id, updateProductDto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify exists
    return this.productRepository.delete(id);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    return this.productRepository.updateStock(id, quantity);
  }
}
