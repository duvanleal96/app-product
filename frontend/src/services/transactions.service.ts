import api from './api';
import type {
  Customer,
  CreateCustomerDto,
  Transaction,
  CreateTransactionDto,
  ProcessPaymentDto,
} from '../types';

export const customersApi = {
  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  findOrCreate: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post<Customer>('/customers/find-or-create', data);
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },
};

export const transactionsApi = {
  create: async (data: CreateTransactionDto): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  processPayment: async (
    id: string,
    data: ProcessPaymentDto
  ): Promise<Transaction> => {
    const response = await api.post<Transaction>(
      `/transactions/${id}/process-payment`,
      data
    );
    return response.data;
  },

  syncPaymentStatus: async (id: string): Promise<Transaction> => {
    const response = await api.post<Transaction>(
      `/transactions/${id}/sync-status`
    );
    return response.data;
  },
};
