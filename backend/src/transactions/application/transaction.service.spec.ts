import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import {
  TRANSACTION_REPOSITORY,
  ITransactionRepository,
} from '../domain/repositories/transaction.repository.interface';
import { ProductService } from '../../products/application/product.service';
import { CustomerService } from '../../customers/application/customer.service';
import { WompiService } from '../infrastructure/wompi/wompi.service';
import {
  Transaction,
  TransactionStatus,
} from '../domain/entities/transaction.entity';
import { mockTransaction, mockCreateTransactionDto } from '../test-cases';
import { Product } from 'src/products/domain/entities/product.entity';
import { Customer } from 'src/customers/domain/entities/customer.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<ITransactionRepository>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockCustomerService: jest.Mocked<CustomerService>;
  let mockWompiService: jest.Mocked<WompiService>;
  let mockConfigService: jest.Mocked<ConfigService>;

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
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCategory: jest.fn(),
      findAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      reduceStock: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    mockCustomerService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOrCreate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<CustomerService>;

    mockWompiService = {
      tokenizeCard: jest.fn(),
      getAcceptanceToken: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
      waitForTransactionStatus: jest.fn(),
      verifyEventSignature: jest.fn(),
    } as unknown as jest.Mocked<WompiService>;

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-key'),
    } as unknown as jest.Mocked<ConfigService>;

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
      mockRepository.findAll.mockResolvedValue(transactions as Transaction[]);

      const result = await service.findAll();

      expect(result).toEqual(transactions);
      expect(mockRepository.findAll.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    it('should return a transaction when found', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as Transaction);

      const result = await service.findById(mockTransaction.id as string);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findById.mock.calls.length).toBeGreaterThan(0);
    });

    it('should throw error when transaction not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow();
    });
  });

  describe('findByCustomerId', () => {
    it('should return transactions by customer ID', async () => {
      const transactions = [mockTransaction];
      mockRepository.findByCustomerId.mockResolvedValue(
        transactions as Transaction[],
      );

      const result = await service.findByCustomerId('cust1');

      expect(result).toEqual(transactions);
      expect(mockRepository.findByCustomerId.mock.calls.length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('findByStatus', () => {
    it('should return transactions by status', async () => {
      const transactions = [mockTransaction];
      mockRepository.findByStatus.mockResolvedValue(
        transactions as Transaction[],
      );

      const result = await service.findByStatus(TransactionStatus.PENDING);

      expect(result).toEqual(transactions);
      expect(mockRepository.findByStatus.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      mockCustomerService.findById.mockResolvedValue(
        mockTransaction.customer as Customer,
      );
      mockProductService.findById.mockResolvedValue(
        mockTransaction.product as Product,
      );
      mockRepository.create.mockResolvedValue(mockTransaction as Transaction);

      const result = await service.create(mockCreateTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockCustomerService.findById.mock.calls.length).toBeGreaterThan(0);
      expect(mockProductService.findById.mock.calls.length).toBeGreaterThan(0);
      expect(mockRepository.create.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction as Transaction);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockTransaction.id as string);

      expect(mockRepository.delete.mock.calls.length).toBeGreaterThan(0);
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
      mockRepository.findById.mockResolvedValue(mockTransaction as Transaction);
      mockRepository.update.mockResolvedValue(
        updatedTransaction as Transaction,
      );
      mockProductService.reduceStock.mockResolvedValue(
        mockTransaction.product as Product,
      );

      const result = await service.updateTransactionFromWebhook(
        '1',
        wompiStatus,
        wompiTransactionId,
        webhookData,
      );

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(mockProductService.reduceStock.mock.calls.length).toBeGreaterThan(
        0,
      );
      expect(mockRepository.update.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
