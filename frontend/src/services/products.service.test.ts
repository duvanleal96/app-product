import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsApi } from './products.service';
import api from './api';
import type { Product } from '../types';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: '1',
  name: 'Laptop HP',
  description: 'High performance laptop',
  price: 2499000,
  stock: 10,
  imageUrl: 'https://example.com/laptop.jpg',
  category: 'Laptops',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockProducts: Product[] = [
  mockProduct,
  {
    id: '2',
    name: 'Mouse Logitech',
    description: 'Wireless mouse',
    price: 89000,
    stock: 25,
    imageUrl: 'https://example.com/mouse.jpg',
    category: 'Accessories',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('productsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all products', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockProducts,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getAll();

      expect(api.get).toHaveBeenCalledWith('/products');
      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
    });

    it('should handle errors when fetching all products', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

      await expect(productsApi.getAll()).rejects.toThrow(errorMessage);
      expect(api.get).toHaveBeenCalledWith('/products');
    });
  });

  describe('getAvailable', () => {
    it('should fetch only available products', async () => {
      const availableProducts = [mockProduct];
      vi.mocked(api.get).mockResolvedValueOnce({
        data: availableProducts,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getAvailable();

      expect(api.get).toHaveBeenCalledWith('/products/available');
      expect(result).toEqual(availableProducts);
      expect(result.length).toBe(1);
    });

    it('should return empty array when no products available', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getAvailable();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle errors when fetching available products', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Server error'));

      await expect(productsApi.getAvailable()).rejects.toThrow('Server error');
    });
  });

  describe('getById', () => {
    it('should fetch a product by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockProduct,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getById('1');

      expect(api.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockProduct);
      expect(result.id).toBe('1');
    });

    it('should handle invalid product id', async () => {
      vi.mocked(api.get).mockRejectedValueOnce({
        message: 'Product not found',
        statusCode: 404,
      });

      await expect(productsApi.getById('invalid-id')).rejects.toMatchObject({
        message: 'Product not found',
        statusCode: 404,
      });
      expect(api.get).toHaveBeenCalledWith('/products/invalid-id');
    });

    it('should handle network errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(productsApi.getById('1')).rejects.toThrow('Network timeout');
    });
  });

  describe('getByCategory', () => {
    it('should fetch products by category', async () => {
      const laptops = [mockProduct];
      vi.mocked(api.get).mockResolvedValueOnce({
        data: laptops,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getByCategory('Laptops');

      expect(api.get).toHaveBeenCalledWith('/products?category=Laptops');
      expect(result).toEqual(laptops);
      expect(result[0].category).toBe('Laptops');
    });

    it('should return empty array for category with no products', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await productsApi.getByCategory('NonExistent');

      expect(api.get).toHaveBeenCalledWith('/products?category=NonExistent');
      expect(result).toEqual([]);
    });

    it('should handle special characters in category name', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await productsApi.getByCategory('Laptops & Computers');

      expect(api.get).toHaveBeenCalledWith('/products?category=Laptops & Computers');
    });

    it('should handle errors when fetching by category', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Database error'));

      await expect(productsApi.getByCategory('Laptops')).rejects.toThrow('Database error');
    });
  });

  describe('API integration', () => {
    it('should use the correct api instance for all methods', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await productsApi.getAll();
      await productsApi.getAvailable();
      await productsApi.getById('1');
      await productsApi.getByCategory('test');

      expect(api.get).toHaveBeenCalledTimes(4);
    });
  });
});
