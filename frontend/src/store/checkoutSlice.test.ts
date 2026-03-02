import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer, {
  setCustomer,
  setDeliveryInfo,
  setCardInfo,
  setStep,
  nextStep,
  previousStep,
  clearCheckout,
  clearError,
  createCustomer,
  createTransaction,
  processPayment,
} from './checkoutSlice';
import { customersApi, transactionsApi } from '../services/transactions.service';
import type {
  CreateCustomerDto,
  DeliveryInfo,
  Customer,
  Transaction,
  ProcessPaymentDto,
} from '../types';

vi.mock('../services/transactions.service', () => ({
  customersApi: {
    findOrCreate: vi.fn(),
  },
  transactionsApi: {
    create: vi.fn(),
    processPayment: vi.fn(),
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

const mockDeliveryInfo: DeliveryInfo = {
  fullName: 'Juan Pérez',
  phone: '3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
  department: 'Cundinamarca',
};

const mockCardInfo = {
  cardNumber: '4242424242424242',
  cardExpMonth: '12',
  cardExpYear: '26',
  cardCvc: '123',
  cardHolder: 'JUAN PEREZ',
  installments: '1',
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
  deliveryInfo: mockDeliveryInfo,
};

describe('checkoutSlice', () => {
  let store: ReturnType<typeof configureStore<{ checkout: ReturnType<typeof checkoutReducer> }>>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        checkout: checkoutReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().checkout;
      expect(state).toEqual({
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 1,
      });
    });
  });

  describe('synchronous reducers', () => {
    it('should set customer data', () => {
      store.dispatch(setCustomer(mockCustomerDto));
      const state = store.getState().checkout;
      expect(state.customer).toEqual(mockCustomerDto);
    });

    it('should set delivery info', () => {
      store.dispatch(setDeliveryInfo(mockDeliveryInfo));
      const state = store.getState().checkout;
      expect(state.deliveryInfo).toEqual(mockDeliveryInfo);
    });

    it('should set card info', () => {
      store.dispatch(setCardInfo(mockCardInfo));
      const state = store.getState().checkout;
      expect(state.cardInfo).toEqual(mockCardInfo);
    });

    it('should set specific step', () => {
      store.dispatch(setStep(3));
      const state = store.getState().checkout;
      expect(state.currentStep).toBe(3);
    });

    it('should increment step with nextStep', () => {
      store.dispatch(nextStep());
      let state = store.getState().checkout;
      expect(state.currentStep).toBe(2);

      store.dispatch(nextStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(3);
    });

    it('should decrement step with previousStep', () => {
      store.dispatch(setStep(3));
      store.dispatch(previousStep());
      let state = store.getState().checkout;
      expect(state.currentStep).toBe(2);

      store.dispatch(previousStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(1);
    });

    it('should not go below step 1 with previousStep', () => {
      store.dispatch(previousStep());
      const state = store.getState().checkout;
      expect(state.currentStep).toBe(1);
    });

    it('should clear checkout state', () => {
      // Set some data first
      store.dispatch(setCustomer(mockCustomerDto));
      store.dispatch(setDeliveryInfo(mockDeliveryInfo));
      store.dispatch(setStep(3));

      // Clear checkout
      store.dispatch(clearCheckout());
      const state = store.getState().checkout;
      expect(state).toEqual({
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 1,
      });
    });

    it('should clear error', () => {
      // Manually set error through reducer
      const stateWithError = checkoutReducer(
        { ...store.getState().checkout, error: 'Test error' },
        { type: 'test' }
      );
      expect(stateWithError.error).toBe('Test error');

      // Clear error
      const clearedState = checkoutReducer(stateWithError, clearError());
      expect(clearedState.error).toBeNull();
    });
  });

  describe('createCustomer async thunk', () => {
    it('should handle createCustomer pending state', () => {
      const action = { type: createCustomer.pending.type };
      const state = checkoutReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createCustomer fulfilled state', async () => {
      vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);

      await store.dispatch(createCustomer(mockCustomerDto));
      const state = store.getState().checkout;

      expect(customersApi.findOrCreate).toHaveBeenCalledWith(mockCustomerDto);
      expect(state.loading).toBe(false);
      expect(state.customerId).toBe('customer-123');
      expect(state.error).toBeNull();
    });

    it('should handle createCustomer rejected state', async () => {
      const errorMessage = 'Customer creation failed';
      vi.mocked(customersApi.findOrCreate).mockRejectedValueOnce({
        message: errorMessage,
      });

      await store.dispatch(createCustomer(mockCustomerDto));
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.customerId).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should handle createCustomer with generic error', async () => {
      vi.mocked(customersApi.findOrCreate).mockRejectedValueOnce(new Error());

      await store.dispatch(createCustomer(mockCustomerDto));
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to create customer');
    });

    it('should use findOrCreate to allow multiple purchases', async () => {
      vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);

      await store.dispatch(createCustomer(mockCustomerDto));

      expect(customersApi.findOrCreate).toHaveBeenCalledWith(mockCustomerDto);
      expect(customersApi.findOrCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTransaction async thunk', () => {
    it('should handle createTransaction pending state', () => {
      const action = { type: createTransaction.pending.type };
      const state = checkoutReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createTransaction fulfilled state', async () => {
      const transactionDto = {
        customerId: 'customer-123',
        productId: 'product-1',
        quantity: 1,
        baseFee: 5000,
        deliveryFee: 10000,
      };
      vi.mocked(transactionsApi.create).mockResolvedValueOnce(mockTransaction);

      await store.dispatch(createTransaction(transactionDto));
      const state = store.getState().checkout;

      expect(transactionsApi.create).toHaveBeenCalledWith(transactionDto);
      expect(state.loading).toBe(false);
      expect(state.transaction).toEqual(mockTransaction);
      expect(state.error).toBeNull();
    });

    it('should handle createTransaction rejected state', async () => {
      const errorMessage = 'Insufficient stock';
      const transactionDto = {
        customerId: 'customer-123',
        productId: 'product-1',
        quantity: 1,
        baseFee: 5000,
        deliveryFee: 10000,
      };
      vi.mocked(transactionsApi.create).mockRejectedValueOnce({
        message: errorMessage,
      });

      await store.dispatch(createTransaction(transactionDto));
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.transaction).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should handle createTransaction with generic error', async () => {
      const transactionDto = {
        customerId: 'customer-123',
        productId: 'product-1',
        quantity: 1,
        baseFee: 5000,
        deliveryFee: 10000,
      };
      vi.mocked(transactionsApi.create).mockRejectedValueOnce(new Error());

      await store.dispatch(createTransaction(transactionDto));
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to create transaction');
    });
  });

  describe('processPayment async thunk', () => {
    it('should handle processPayment pending state', () => {
      const action = { type: processPayment.pending.type };
      const state = checkoutReducer(undefined, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle processPayment fulfilled state', async () => {
      const approvedTransaction = {
        ...mockTransaction,
        status: 'APPROVED' as const,
      };
      vi.mocked(transactionsApi.processPayment).mockResolvedValueOnce(
        approvedTransaction
      );

      await store.dispatch(
        processPayment({
          transactionId: 'txn-123',
          paymentData: mockPaymentDto,
        })
      );
      const state = store.getState().checkout;

      expect(transactionsApi.processPayment).toHaveBeenCalledWith(
        'txn-123',
        mockPaymentDto
      );
      expect(state.loading).toBe(false);
      expect(state.transaction?.status).toBe('APPROVED');
      expect(state.error).toBeNull();
    });

    it('should handle processPayment rejected state', async () => {
      const errorMessage = 'Card declined';
      vi.mocked(transactionsApi.processPayment).mockRejectedValueOnce({
        message: errorMessage,
      });

      await store.dispatch(
        processPayment({
          transactionId: 'txn-123',
          paymentData: mockPaymentDto,
        })
      );
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle processPayment with generic error', async () => {
      vi.mocked(transactionsApi.processPayment).mockRejectedValueOnce(
        new Error()
      );

      await store.dispatch(
        processPayment({
          transactionId: 'txn-123',
          paymentData: mockPaymentDto,
        })
      );
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Payment failed');
    });

    it('should handle declined payment status', async () => {
      const declinedTransaction = {
        ...mockTransaction,
        status: 'DECLINED' as const,
      };
      vi.mocked(transactionsApi.processPayment).mockResolvedValueOnce(
        declinedTransaction
      );

      await store.dispatch(
        processPayment({
          transactionId: 'txn-123',
          paymentData: mockPaymentDto,
        })
      );
      const state = store.getState().checkout;

      expect(state.loading).toBe(false);
      expect(state.transaction?.status).toBe('DECLINED');
      expect(state.error).toBeNull(); // No error, but status is DECLINED
    });
  });

  describe('complete checkout flow', () => {
    it('should handle full checkout flow', async () => {
      // Step 1: Set customer info
      store.dispatch(setCustomer(mockCustomerDto));
      let state = store.getState().checkout;
      expect(state.customer).toEqual(mockCustomerDto);
      expect(state.currentStep).toBe(1);

      // Step 2: Create customer
      vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);
      await store.dispatch(createCustomer(mockCustomerDto));
      state = store.getState().checkout;
      expect(state.customerId).toBe('customer-123');

      store.dispatch(nextStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(2);

      // Step 3: Set delivery info
      store.dispatch(setDeliveryInfo(mockDeliveryInfo));
      state = store.getState().checkout;
      expect(state.deliveryInfo).toEqual(mockDeliveryInfo);

      store.dispatch(nextStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(3);

      // Step 4: Create transaction
      const transactionDto = {
        customerId: 'customer-123',
        productId: 'product-1',
        quantity: 1,
        baseFee: 5000,
        deliveryFee: 10000,
      };
      vi.mocked(transactionsApi.create).mockResolvedValueOnce(mockTransaction);
      await store.dispatch(createTransaction(transactionDto));
      state = store.getState().checkout;
      expect(state.transaction).toEqual(mockTransaction);

      // Step 5: Set card info and process payment
      store.dispatch(setCardInfo(mockCardInfo));
      state = store.getState().checkout;
      expect(state.cardInfo).toEqual(mockCardInfo);

      const approvedTransaction = {
        ...mockTransaction,
        status: 'APPROVED' as const,
      };
      vi.mocked(transactionsApi.processPayment).mockResolvedValueOnce(
        approvedTransaction
      );
      await store.dispatch(
        processPayment({
          transactionId: 'txn-123',
          paymentData: mockPaymentDto,
        })
      );
      state = store.getState().checkout;
      expect(state.transaction?.status).toBe('APPROVED');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle going back in checkout flow', async () => {
      store.dispatch(setStep(3));
      let state = store.getState().checkout;
      expect(state.currentStep).toBe(3);

      store.dispatch(previousStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(2);

      store.dispatch(previousStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(1);

      // Should not go below 1
      store.dispatch(previousStep());
      state = store.getState().checkout;
      expect(state.currentStep).toBe(1);
    });

    it('should clear all state when checkout is cleared', async () => {
      // Set up complete state
      store.dispatch(setCustomer(mockCustomerDto));
      store.dispatch(setDeliveryInfo(mockDeliveryInfo));
      store.dispatch(setCardInfo(mockCardInfo));
      store.dispatch(setStep(3));

      vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);
      await store.dispatch(createCustomer(mockCustomerDto));

      let state = store.getState().checkout;
      expect(state.customer).not.toBeNull();
      expect(state.customerId).not.toBeNull();
      expect(state.deliveryInfo).not.toBeNull();
      expect(state.cardInfo).not.toBeNull();
      expect(state.currentStep).toBe(3);

      // Clear everything
      store.dispatch(clearCheckout());
      state = store.getState().checkout;
      expect(state).toEqual({
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 1,
      });
    });
  });

  describe('error handling', () => {
    it('should clear error state independently', async () => {
      // Trigger an error
      vi.mocked(customersApi.findOrCreate).mockRejectedValueOnce({
        message: 'Test error',
      });
      await store.dispatch(createCustomer(mockCustomerDto));

      let state = store.getState().checkout;
      expect(state.error).toBe('Test error');
      expect(state.loading).toBe(false);

      // Clear only error
      store.dispatch(clearError());
      state = store.getState().checkout;
      expect(state.error).toBeNull();
    });

    it('should reset error when starting new async operation', async () => {
      // Set initial error
      vi.mocked(customersApi.findOrCreate).mockRejectedValueOnce({
        message: 'First error',
      });
      await store.dispatch(createCustomer(mockCustomerDto));

      let state = store.getState().checkout;
      expect(state.error).toBe('First error');

      // Start new operation - error should be cleared
      vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);
      const promise = store.dispatch(createCustomer(mockCustomerDto));

      // Check error is cleared in pending state
      state = store.getState().checkout;
      expect(state.error).toBeNull();
      expect(state.loading).toBe(true);

      await promise;
      state = store.getState().checkout;
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
    });
  });
});
