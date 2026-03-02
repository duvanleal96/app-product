import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../../application/product.service';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import {
  mockProduct,
  mockCreateProductDto,
  mockUpdateProductDto,
} from '../../test-cases';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    findAvailable: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products when no category filter provided', async () => {
      mockProductService.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.findAll();

      expect(result).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByCategory).not.toHaveBeenCalled();
    });

    it('should return products filtered by category when category is provided', async () => {
      mockProductService.findByCategory.mockResolvedValue([mockProduct]);

      const result = await controller.findAll('electronics');

      expect(result).toEqual([mockProduct]);
      expect(service.findByCategory).toHaveBeenCalledWith('electronics');
      expect(service.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no products exist', async () => {
      mockProductService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAvailable', () => {
    it('should return available products with stock > 0', async () => {
      mockProductService.findAvailable.mockResolvedValue([mockProduct]);

      const result = await controller.findAvailable();

      expect(result).toEqual([mockProduct]);
      expect(service.findAvailable).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products available', async () => {
      mockProductService.findAvailable.mockResolvedValue([]);

      const result = await controller.findAvailable();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductService.findById.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProduct.id);

      expect(result).toEqual(mockProduct);
      expect(service.findById).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should return null when product not found', async () => {
      mockProductService.findById.mockResolvedValue(null);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      mockProductService.create.mockResolvedValue({ ...mockProduct, ...mockCreateProductDto });

      const result = await controller.create(mockCreateProductDto);

      expect(result.name).toBe(mockCreateProductDto.name);
      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const updated = { ...mockProduct, ...mockUpdateProductDto };

      mockProductService.update.mockResolvedValue(updated);

      const result = await controller.update(mockProduct.id, mockUpdateProductDto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(mockProduct.id, mockUpdateProductDto);
    });

    it('should update only stock', async () => {
      const updateDto: UpdateProductDto = { stock: 25 };
      const updated = { ...mockProduct, stock: 25 };

      mockProductService.update.mockResolvedValue(updated);

      const result = await controller.update(mockProduct.id, updateDto);

      expect(result.stock).toBe(25);
    });
  });

  describe('delete', () => {
    it('should delete a product and return success message', async () => {
      mockProductService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockProduct.id);

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(service.delete).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});
