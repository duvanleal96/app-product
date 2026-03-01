import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveryRepository } from './delivery.repository';
import {
  Delivery,
  DeliveryStatus,
} from '../../domain/entities/delivery.entity';

describe('DeliveryRepository', () => {
  let repository: DeliveryRepository;

  const mockDelivery: Partial<Delivery> = {
    id: '1',
    fullName: 'John Doe',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
    department: 'Test Dept',
    notes: 'Leave at door',
    status: DeliveryStatus.PENDING,
    estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
        DeliveryRepository,
        {
          provide: getRepositoryToken(Delivery),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<DeliveryRepository>(DeliveryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all deliveries ordered by createdAt DESC', async () => {
      const deliveries = [mockDelivery];
      mockTypeormRepository.find.mockResolvedValue(deliveries);

      const result = await repository.findAll();

      expect(result).toEqual(deliveries);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        relations: ['transaction'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no deliveries exist', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a delivery when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockDelivery);

      const result = await repository.findById('1');

      expect(result).toEqual(mockDelivery);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['transaction'],
      });
    });

    it('should return null when delivery not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByTransactionId', () => {
    it('should return a delivery by transaction id', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockDelivery);

      const result = await repository.findByTransactionId('txn1');

      expect(result).toEqual(mockDelivery);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { transaction: { id: 'txn1' } },
        relations: ['transaction'],
      });
    });

    it('should return null when no delivery found for transaction', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByTransactionId('txn999');

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return deliveries filtered by status', async () => {
      const deliveries = [mockDelivery];
      mockTypeormRepository.find.mockResolvedValue(deliveries);

      const result = await repository.findByStatus(DeliveryStatus.PENDING);

      expect(result).toEqual(deliveries);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { status: DeliveryStatus.PENDING },
        relations: ['transaction'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no deliveries match status', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findByStatus(DeliveryStatus.DELIVERED);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and save a new delivery', async () => {
      const deliveryData: Partial<Delivery> = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        address: '456 Oak Ave',
        city: 'Another City',
        status: DeliveryStatus.PENDING,
      };

      mockTypeormRepository.create.mockReturnValue(mockDelivery);
      mockTypeormRepository.save.mockResolvedValue(mockDelivery);

      const result = await repository.create(deliveryData);

      expect(result).toEqual(mockDelivery);
      expect(mockTypeormRepository.create).toHaveBeenCalledWith(deliveryData);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockDelivery);
    });
  });

  describe('update', () => {
    it('should update and return the delivery', async () => {
      const updateData: Partial<Delivery> = {
        status: DeliveryStatus.IN_TRANSIT,
        city: 'Updated City',
      };
      const updatedDelivery = { ...mockDelivery, ...updateData };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updatedDelivery);

      const result = await repository.update('1', updateData);

      expect(result).toEqual(updatedDelivery);
      expect(mockTypeormRepository.update).toHaveBeenCalledWith(
        '1',
        updateData,
      );
    });

    it('should throw error when delivery not found after update', async () => {
      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(null);

      await expect(
        repository.update('999', { status: DeliveryStatus.IN_TRANSIT }),
      ).rejects.toThrow('Delivery not found after update');
    });
  });

  describe('delete', () => {
    it('should delete a delivery by id', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete('1');

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should not throw when deleting non-existent delivery', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(repository.delete('999')).resolves.not.toThrow();
    });
  });
});
