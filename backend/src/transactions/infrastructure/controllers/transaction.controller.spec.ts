import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../../application/transaction.service';
import { TransactionStatus } from '../../domain/entities/transaction.entity';
import {
  mockTransaction,
  mockTransactionApproved,
  mockCreateTransactionDto,
  mockProcessPaymentDto,
} from '../../test-cases';
import { ProcessPaymentDto } from 'src/transactions/application/dto/process-payment.dto';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockTransactionService = {
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByCustomerId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    processPayment: jest.fn(),
    syncPaymentStatus: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transactions when no status filter provided', async () => {
      mockTransactionService.findAll.mockResolvedValue([mockTransaction]);

      const result = await controller.findAll();

      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionService.findAll).toHaveBeenCalledTimes(1);
      expect(mockTransactionService.findByStatus).not.toHaveBeenCalled();
    });

    it('should return transactions filtered by status when status is provided', async () => {
      mockTransactionService.findByStatus.mockResolvedValue([mockTransaction]);

      const result = await controller.findAll('PENDING');

      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionService.findByStatus).toHaveBeenCalledWith(
        'PENDING',
      );
      expect(mockTransactionService.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no transactions exist', async () => {
      mockTransactionService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByCustomer', () => {
    it('should return transactions for a specific customer', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174111';
      mockTransactionService.findByCustomerId.mockResolvedValue([
        mockTransaction,
      ]);

      const result = await controller.findByCustomer(customerId);

      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionService.findByCustomerId).toHaveBeenCalledWith(
        customerId,
      );
    });

    it('should return empty array when customer has no transactions', async () => {
      mockTransactionService.findByCustomerId.mockResolvedValue([]);

      const result = await controller.findByCustomer(
        '123e4567-e89b-12d3-a456-426614174222',
      );

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockTransactionService.findById.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockTransaction.id as string);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.findById).toHaveBeenCalledWith(
        mockTransaction.id,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new transaction', async () => {
      mockTransactionService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(mockCreateTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.create).toHaveBeenCalledWith(
        mockCreateTransactionDto,
      );
    });
  });

  describe('processPayment', () => {
    it('should process payment and return transaction with parsed wompiDetails', async () => {
      mockTransactionService.processPayment.mockResolvedValue(
        mockTransactionApproved,
      );

      const result = await controller.processPayment(
        mockTransaction.id as string,
        mockProcessPaymentDto,
      );

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(result.wompiDetails).toEqual({
        id: 'wompi-123',
        status: 'APPROVED',
      });
      expect(mockTransactionService.processPayment).toHaveBeenCalledWith(
        mockTransaction.id,
        mockProcessPaymentDto,
      );
    });

    it('should return wompiDetails as null when paymentResponse is null', async () => {
      mockTransactionService.processPayment.mockResolvedValue(mockTransaction);

      const result = await controller.processPayment(
        mockTransaction.id as string,
        {} as ProcessPaymentDto,
      );

      expect(result.wompiDetails).toBeNull();
    });

    it('should return wompiDetails as null when paymentResponse is invalid JSON', async () => {
      const txWithBadJson = { ...mockTransaction, paymentResponse: 'not-json' };
      mockTransactionService.processPayment.mockResolvedValue(txWithBadJson);

      const result = await controller.processPayment(
        mockTransaction.id as string,
        {} as ProcessPaymentDto,
      );

      expect(result.wompiDetails).toBeNull();
    });
  });

  describe('syncPaymentStatus', () => {
    it('should sync and return transaction with parsed wompiDetails', async () => {
      mockTransactionService.syncPaymentStatus.mockResolvedValue(
        mockTransactionApproved,
      );

      const result = await controller.syncPaymentStatus(
        mockTransaction.id as string,
      );

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(result.wompiDetails).toEqual({
        id: 'wompi-123',
        status: 'APPROVED',
      });
      expect(mockTransactionService.syncPaymentStatus).toHaveBeenCalledWith(
        mockTransaction.id,
      );
    });

    it('should return wompiDetails as null when paymentResponse is null', async () => {
      mockTransactionService.syncPaymentStatus.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.syncPaymentStatus(
        mockTransaction.id as string,
      );

      expect(result.wompiDetails).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a transaction and return success message', async () => {
      mockTransactionService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockTransaction.id as string);

      expect(result).toEqual({ message: 'Transaction deleted successfully' });
      expect(mockTransactionService.delete).toHaveBeenCalledWith(
        mockTransaction.id as string,
      );
    });
  });
});
