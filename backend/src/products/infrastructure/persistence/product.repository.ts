import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.repository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAvailable(): Promise<Product[]> {
    return this.repository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.stock > :stock', { stock: 0 })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.repository.create(productData);
    return this.repository.save(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    await this.repository.update(id, productData);
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found after update');
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    product.stock = newStock; // Setear el nuevo stock (no restar)
    return this.repository.save(product);
  }
}
