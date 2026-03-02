import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from './transaction.service';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';
import { ProductService } from '../../products/application/product.service';
import { CustomerService } from '../../customers/application/customer.service';
import { WompiService } from '../infrastructure/wompi/wompi.service';
import { TransactionStatus } from '../domain/entities/transaction.entity';
import {
  mockTransaction,
  mockCreateTransactionDto,
} from '../test-cases';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: any;
  let mockProductService: any;
  let mockCustomerService: any;
  let mockWompiService: any;
  let mockConfigService: any;

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

      const result = await service.findById(mockTransaction.id);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockTransaction.id);
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
      mockCustomerService.findById.mockResolvedValue(mockTransaction.customer);
      mockProductService.findById.mockResolvedValue(mockTransaction.product);
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(mockCreateTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockCustomerService.findById).toHaveBeenCalledWith(mockCreateTransactionDto.customerId);
      expect(mockProductService.findById).toHaveBeenCalledWith(mockCreateTransactionDto.productId);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      mockRepository.findById.mockResolvedValue(mockTransaction);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockTransaction.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockTransaction.id);
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
