import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customersApi, transactionsApi } from './transactions.service';
import api from './api';
import type {
  Customer,
  CreateCustomerDto,
  Transaction,
  CreateTransactionDto,
  ProcessPaymentDto,
} from '../types';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockCustomerDto: CreateCustomerDto = {
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  documentType: 'CC',
  documentNumber: '1234567890',
  address: 'Calle 123',
  city: 'Bogotá',
  country: 'Colombia',
};

const mockCustomer: Customer = {
  id: 'customer-123',
  ...mockCustomerDto,
};

const mockTransactionDto: CreateTransactionDto = {
  customerId: 'customer-123',
  productId: 'product-1',
  quantity: 1,
  baseFee: 5000,
  deliveryFee: 10000,
};

const mockTransaction: Transaction = {
  id: 'txn-123',
  product: {
    id: 'product-1',
    name: 'Laptop HP',
    description: 'High performance laptop',
    price: 2499000,
    stock: 10,
    imageUrl: 'https://example.com/laptop.jpg',
    category: 'Laptops',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  customer: mockCustomer,
  quantity: 1,
  unitPrice: 2499000,
  subtotal: 2499000,
  baseFee: 5000,
  deliveryFee: 10000,
  total: 2514000,
  status: 'PENDING',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPaymentDto: ProcessPaymentDto = {
  cardNumber: '4242424242424242',
  cardExpMonth: '12',
  cardExpYear: '26',
  cardCvc: '123',
  cardHolder: 'JUAN PEREZ',
  installments: 1,
  deliveryInfo: {
    fullName: 'Juan Pérez',
    phone: '3001234567',
    address: 'Calle 123',
    city: 'Bogotá',
    department: 'Cundinamarca',
  },
};

describe('customersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockCustomer,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await customersApi.create(mockCustomerDto);

      expect(api.post).toHaveBeenCalledWith('/customers', mockCustomerDto);
      expect(result).toEqual(mockCustomer);
      expect(result.id).toBe('customer-123');
    });

    it('should handle validation errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Validation failed',
        statusCode: 400,
      });

      await expect(customersApi.create(mockCustomerDto)).rejects.toMatchObject({
        message: 'Validation failed',
        statusCode: 400,
      });
    });

    it('should handle network errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(customersApi.create(mockCustomerDto)).rejects.toThrow('Network timeout');
    });
  });

  describe('findOrCreate', () => {
    it('should find or create a customer', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockCustomer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await customersApi.findOrCreate(mockCustomerDto);

      expect(api.post).toHaveBeenCalledWith('/customers/find-or-create', mockCustomerDto);
      expect(result).toEqual(mockCustomer);
    });

    it('should return existing customer if found', async () => {
      const existingCustomer = { ...mockCustomer, id: 'existing-123' };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: existingCustomer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await customersApi.findOrCreate(mockCustomerDto);

      expect(result.id).toBe('existing-123');
    });

    it('should handle errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Database error'));

      await expect(customersApi.findOrCreate(mockCustomerDto)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should fetch a customer by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockCustomer,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await customersApi.getById('customer-123');

      expect(api.get).toHaveBeenCalledWith('/customers/customer-123');
      expect(result).toEqual(mockCustomer);
    });

    it('should handle customer not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce({
        message: 'Customer not found',
        statusCode: 404,
      });

      await expect(customersApi.getById('invalid-id')).rejects.toMatchObject({
        message: 'Customer not found',
        statusCode: 404,
      });
    });
  });
});

describe('transactionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockTransaction,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.create(mockTransactionDto);

      expect(api.post).toHaveBeenCalledWith('/transactions', mockTransactionDto);
      expect(result).toEqual(mockTransaction);
      expect(result.id).toBe('txn-123');
      expect(result.status).toBe('PENDING');
    });

    it('should handle insufficient stock error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Insufficient stock',
        statusCode: 400,
      });

      await expect(transactionsApi.create(mockTransactionDto)).rejects.toMatchObject({
        message: 'Insufficient stock',
        statusCode: 400,
      });
    });

    it('should handle invalid customer id', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Customer not found',
        statusCode: 404,
      });

      await expect(transactionsApi.create(mockTransactionDto)).rejects.toMatchObject({
        message: 'Customer not found',
      });
    });
  });

  describe('getById', () => {
    it('should fetch a transaction by id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.getById('txn-123');

      expect(api.get).toHaveBeenCalledWith('/transactions/txn-123');
      expect(result).toEqual(mockTransaction);
    });

    it('should handle transaction not found', async () => {
      vi.mocked(api.get).mockRejectedValueOnce({
        message: 'Transaction not found',
        statusCode: 404,
      });

      await expect(transactionsApi.getById('invalid-id')).rejects.toMatchObject({
        message: 'Transaction not found',
        statusCode: 404,
      });
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const approvedTransaction = {
        ...mockTransaction,
        status: 'APPROVED' as const,
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: approvedTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.processPayment('txn-123', mockPaymentDto);

      expect(api.post).toHaveBeenCalledWith('/transactions/txn-123/process-payment', mockPaymentDto);
      expect(result.status).toBe('APPROVED');
    });

    it('should handle payment declined', async () => {
      const declinedTransaction = {
        ...mockTransaction,
        status: 'DECLINED' as const,
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: declinedTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.processPayment('txn-123', mockPaymentDto);

      expect(result.status).toBe('DECLINED');
    });

    it('should handle invalid card information', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Invalid card information',
        statusCode: 400,
      });

      await expect(transactionsApi.processPayment('txn-123', mockPaymentDto))
        .rejects.toMatchObject({
          message: 'Invalid card information',
          statusCode: 400,
        });
    });

    it('should handle payment gateway timeout', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Payment gateway timeout',
        statusCode: 504,
      });

      await expect(transactionsApi.processPayment('txn-123', mockPaymentDto))
        .rejects.toMatchObject({
          message: 'Payment gateway timeout',
          statusCode: 504,
        });
    });
  });

  describe('syncPaymentStatus', () => {
    it('should sync payment status from gateway', async () => {
      const approvedTransaction = {
        ...mockTransaction,
        status: 'APPROVED' as const,
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: approvedTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.syncPaymentStatus('txn-123');

      expect(api.post).toHaveBeenCalledWith('/transactions/txn-123/sync-status');
      expect(result.status).toBe('APPROVED');
    });

    it('should handle sync with pending status', async () => {
      const pendingTransaction = {
        ...mockTransaction,
        status: 'PENDING' as const,
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: pendingTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await transactionsApi.syncPaymentStatus('txn-123');

      expect(result.status).toBe('PENDING');
    });

    it('should handle transaction not found during sync', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        message: 'Transaction not found',
        statusCode: 404,
      });

      await expect(transactionsApi.syncPaymentStatus('invalid-id'))
        .rejects.toMatchObject({
          message: 'Transaction not found',
          statusCode: 404,
        });
    });

    it('should handle gateway communication errors', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Gateway unavailable'));

      await expect(transactionsApi.syncPaymentStatus('txn-123'))
        .rejects.toThrow('Gateway unavailable');
    });
  });

  describe('API integration', () => {
    it('should use correct HTTP methods for different operations', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: mockTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      vi.mocked(api.get).mockResolvedValue({
        data: mockTransaction,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await transactionsApi.create(mockTransactionDto);
      await transactionsApi.getById('txn-123');
      await transactionsApi.processPayment('txn-123', mockPaymentDto);
      await transactionsApi.syncPaymentStatus('txn-123');

      expect(api.post).toHaveBeenCalledTimes(3);
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });
});
