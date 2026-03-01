import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product.repository.interface';
import { Product } from '../domain/entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: any;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    category: 'electronics',
    imageUrl: 'test.jpg',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCategory: jest.fn(),
      findAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      mockRepository.findAll.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      const products = [mockProduct];
      mockRepository.findByCategory.mockResolvedValue(products);

      const result = await service.findByCategory('electronics');

      expect(result).toEqual(products);
      expect(mockRepository.findByCategory).toHaveBeenCalledWith('electronics');
    });
  });

  describe('findAvailable', () => {
    it('should return available products', async () => {
      const products = [mockProduct];
      mockRepository.findAvailable.mockResolvedValue(products);

      const result = await service.findAvailable();

      expect(result).toEqual(products);
      expect(mockRepository.findAvailable).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'New Description',
        price: 50000,
        stock: 5,
        category: 'electronics',
      };
      mockRepository.create.mockResolvedValue({ ...mockProduct, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateDto = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateDto };

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('Updated Product');
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing product', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when deleting non-existent product', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reduceStock', () => {
    it('should reduce product stock', async () => {
      const productWithStock = { ...mockProduct, stock: 10 };
      mockRepository.findById.mockResolvedValue(productWithStock);
      mockRepository.updateStock.mockResolvedValue({
        ...productWithStock,
        stock: 7,
      });

      const result = await service.reduceStock('1', 3);

      expect(result.stock).toBe(7);
      expect(mockRepository.updateStock).toHaveBeenCalledWith('1', 7);
    });

    it('should throw error when insufficient stock', async () => {
      const productWithStock = { ...mockProduct, stock: 2 };
      mockRepository.findById.mockResolvedValue(productWithStock);

      await expect(service.reduceStock('1', 5)).rejects.toThrow();
    });
  });
});
