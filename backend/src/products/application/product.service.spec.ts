import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from '../domain/repositories/product.repository.interface';
import {
  mockProduct,
  mockCreateProductDto,
  mockUpdateProductDto,
} from '../test-cases';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: any;

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

      const result = await service.findById(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockProduct.id);
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
      mockRepository.create.mockResolvedValue({ ...mockProduct, ...mockCreateProductDto });

      const result = await service.create(mockCreateProductDto);

      expect(result.name).toBe(mockCreateProductDto.name);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateProductDto);
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };

      mockRepository.findById.mockResolvedValue(mockProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.update(mockProduct.id, mockUpdateProductDto);

      expect(result.name).toBe(mockUpdateProductDto.name);
      expect(mockRepository.update).toHaveBeenCalledWith(mockProduct.id, mockUpdateProductDto);
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

      await service.delete(mockProduct.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockProduct.id);
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
      mockRepository.updateStock.mockResolvedValue({ ...productWithStock, stock: 7 });

      const result = await service.reduceStock(mockProduct.id, 3);

      expect(result.stock).toBe(7);
      expect(mockRepository.updateStock).toHaveBeenCalledWith(mockProduct.id, 7);
    });

    it('should throw error when insufficient stock', async () => {
      const productWithStock = { ...mockProduct, stock: 2 };
      mockRepository.findById.mockResolvedValue(productWithStock);

      await expect(service.reduceStock(mockProduct.id, 5)).rejects.toThrow();
    });
  });
});
