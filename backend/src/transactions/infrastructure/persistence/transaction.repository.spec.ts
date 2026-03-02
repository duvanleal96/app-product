import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionRepository } from './transaction.repository';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/transaction.entity';
import { mockTransaction } from '../../test-cases';

const relations = ['product', 'customer', 'delivery'];

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  const mockTypeormRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transactions with relations ordered by createdAt DESC', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockTransaction]);

      const result = await repository.findAll();

      expect(result).toEqual([mockTransaction]);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        relations,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no transactions exist', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a transaction with relations when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await repository.findById(mockTransaction.id);

      expect(result).toEqual(mockTransaction);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        relations,
      });
    });

    it('should return null when transaction not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByCustomerId', () => {
    it('should return transactions for a customer ordered by createdAt DESC', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockTransaction]);

      const result = await repository.findByCustomerId('cust1');

      expect(result).toEqual([mockTransaction]);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { customer: { id: 'cust1' } },
        relations,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when customer has no transactions', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByCustomerId('cust999');

      expect(result).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should return transactions filtered by status', async () => {
      mockTypeormRepository.find.mockResolvedValue([mockTransaction]);

      const result = await repository.findByStatus(TransactionStatus.PENDING);

      expect(result).toEqual([mockTransaction]);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { status: TransactionStatus.PENDING },
        relations: ['product', 'customer'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no transactions match status', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByStatus(TransactionStatus.APPROVED);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and save a new transaction', async () => {
      const data: Partial<Transaction> = { quantity: 1, total: 100000 };

      mockTypeormRepository.create.mockReturnValue(mockTransaction);
      mockTypeormRepository.save.mockResolvedValue(mockTransaction);

      const result = await repository.create(data);

      expect(result).toEqual(mockTransaction);
      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update and return the transaction', async () => {
      const updateData: Partial<Transaction> = { status: TransactionStatus.APPROVED };
      const updated = { ...mockTransaction, ...updateData };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updated);

      const result = await repository.update(mockTransaction.id, updateData);

      expect(result).toEqual(updated);
      expect(mockTypeormRepository.update).toHaveBeenCalledWith(
        mockTransaction.id,
        updateData,
      );
    });

    it('should throw error when transaction not found after update', async () => {
      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(null);

      await expect(
        repository.update('999', { status: TransactionStatus.APPROVED }),
      ).rejects.toThrow('Transaction not found after update');
    });
  });

  describe('delete', () => {
    it('should delete a transaction by id', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete(mockTransaction.id);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith(mockTransaction.id);
    });

    it('should not throw when deleting non-existent transaction', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(repository.delete('999')).resolves.not.toThrow();
    });
  });
});
