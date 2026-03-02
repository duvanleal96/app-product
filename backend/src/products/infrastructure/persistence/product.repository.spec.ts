import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository';
import { Product } from '../../domain/entities/product.entity';
import { mockProduct } from '../../test-cases';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockTypeormRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products ordered by createdAt DESC', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockProduct]);

      const result = await repository.findAll();

      expect(result).toEqual([mockProduct]);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no products exist', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockProduct);

      const result = await repository.findById(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
    });

    it('should return null when product not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByCategory', () => {
    it('should return active products filtered by category ordered by name', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockProduct]);

      const result = await repository.findByCategory('electronics');

      expect(result).toEqual([mockProduct]);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { category: 'electronics', isActive: true },
        order: { name: 'ASC' },
      });
    });

    it('should return empty array when no products match category', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByCategory('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('findAvailable', () => {
    it('should return available products using query builder', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);

      const result = await repository.findAvailable();

      expect(result).toEqual([mockProduct]);
      expect(mockTypeormRepository.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.stock > :stock',
        { stock: 0 },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'product.createdAt',
        'DESC',
      );
    });

    it('should return empty array when no products available', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.findAvailable();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and save a new product', async () => {
      const productData: Partial<Product> = {
        name: 'New Product',
        price: 50000,
        stock: 5,
      };

      mockTypeormRepository.create.mockReturnValue(mockProduct);
      mockTypeormRepository.save.mockResolvedValue(mockProduct);

      const result = await repository.create(productData);

      expect(result).toEqual(mockProduct);
      expect(mockTypeormRepository.create).toHaveBeenCalledWith(productData);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const updateData: Partial<Product> = { name: 'Updated', price: 90000 };
      const updated = { ...mockProduct, ...updateData };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updated);

      const result = await repository.update(mockProduct.id, updateData);

      expect(result).toEqual(updated);
      expect(mockTypeormRepository.update).toHaveBeenCalledWith(
        mockProduct.id,
        updateData,
      );
    });

    it('should throw error when product not found after update', async () => {
      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('999', { name: 'X' })).rejects.toThrow(
        'Product not found after update',
      );
    });
  });

  describe('delete', () => {
    it('should delete a product by id', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete(mockProduct.id);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('updateStock', () => {
    it('should update product stock and return the product', async () => {
      const updatedProduct = { ...mockProduct, stock: 20 };

      mockTypeormRepository.findOne.mockResolvedValue(mockProduct);
      mockTypeormRepository.save.mockResolvedValue(updatedProduct);

      const result = await repository.updateStock(mockProduct.id, 20);

      expect(result.stock).toBe(20);
      expect(mockTypeormRepository.save).toHaveBeenCalled();
    });

    it('should throw error when product not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      await expect(repository.updateStock('999', 5)).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
