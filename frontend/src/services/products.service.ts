import api from './api';
import type { Product } from '../types';

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  getAvailable: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/available');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products?category=${category}`);
    return response.data;
  },
};
