import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';
import { ProductService } from '../../products/application/product.service';
import { CustomerService } from '../../customers/application/customer.service';
import { WompiService } from '../infrastructure/wompi/wompi.service';
import {
  Transaction,
  TransactionStatus,
} from '../domain/entities/transaction.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: any;
  let mockProductService: any;
  let mockCustomerService: any;
  let mockWompiService: any;
  let mockConfigService: any;

  const mockTransaction: Transaction = {
    id: '1',
    customer: {
      id: 'cust1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Test City',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    product: {
      id: 'prod1',
      name: 'Test Product',
      description: 'Test',
      price: 100000,
      stock: 10,
      category: 'electronics',
      imageUrl: 'test.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    delivery: {
      id: 'del1',
      address: '123 Main St',
      city: 'Test City',
      department: 'Test Dept',
      country: 'Test Country',
      instructions: 'Test instructions',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    quantity: 1,
    amount: 100000,
    status: TransactionStatus.PENDING,
    paymentMethod: 'CARD',
    paymentReference: 'ref123',
    paymentResponse: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockProductService = {
      findById: jest.fn(),
      reduceStock: jest.fn(),
    };

    mockCustomerService = {
      findById: jest.fn(),
      findOrCreate: jest.fn(),
    };

    mockWompiService = {
      createPaymentSource: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
      waitForTransactionStatus: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
        {
          provide: WompiService,
          useValue: mockWompiService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      const transactions = [mockTransaction];
      mockRepository.findAll.mockResolvedValue(transactions);

      const result = await service.findAll();

      expect(result).toEqual(transactions);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a transaction when found', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);

      const result = await service.findById('1');

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when transaction not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow();
    });
  });

  describe('findByCustomerId', () => {
    it('should return transactions by customer ID', async () => {
      const transactions = [mockTransaction];
      mockRepository.findByCustomerId.mockResolvedValue(transactions);

      const result = await service.findByCustomerId('cust1');

      expect(result).toEqual(transactions);
      expect(mockRepository.findByCustomerId).toHaveBeenCalledWith('cust1');
    });
  });

  describe('findByStatus', () => {
    it('should return transactions by status', async () => {
      const transactions = [mockTransaction];
      mockRepository.findByStatus.mockResolvedValue(transactions);

      const result = await service.findByStatus(TransactionStatus.PENDING);

      expect(result).toEqual(transactions);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(
        TransactionStatus.PENDING,
      );
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createDto = {
        customerId: 'cust1',
        productId: 'prod1',
        quantity: 2,
        baseFee: 5000,
        deliveryFee: 10000,
      };

      mockCustomerService.findById.mockResolvedValue(mockTransaction.customer);
      mockProductService.findById.mockResolvedValue(mockTransaction.product);
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockCustomerService.findById).toHaveBeenCalledWith('cust1');
      expect(mockProductService.findById).toHaveBeenCalledWith('prod1');
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('updateTransactionFromWebhook', () => {
    it('should update transaction status from webhook event and reduce stock when approved', async () => {
      const wompiStatus = 'APPROVED';
      const wompiTransactionId = 'wompi-123';
      const webhookData = {
        event: 'transaction.updated',
        data: {
          transaction: {
            id: wompiTransactionId,
            status: wompiStatus,
            payment_method_type: 'CARD',
            amount_in_cents: 100000,
          },
        },
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.APPROVED,
      };
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.update.mockResolvedValue(updatedTransaction);
      mockProductService.reduceStock.mockResolvedValue(mockTransaction.product);

      const result = await service.updateTransactionFromWebhook(
        '1',
        wompiStatus,
        wompiTransactionId,
        webhookData,
      );

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(mockProductService.reduceStock).toHaveBeenCalledWith(
        mockTransaction.product.id,
        mockTransaction.quantity,
      );
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });
});
