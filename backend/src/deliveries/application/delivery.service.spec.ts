import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DELIVERY_REPOSITORY } from '../domain/repositories/delivery.repository.interface';
import { Delivery, DeliveryStatus } from '../domain/entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import {
  Transaction,
  TransactionStatus,
} from '../../transactions/domain/entities/transaction.entity';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let mockRepository: any;

  const mockTransaction: Transaction = {
    id: 'txn1',
    customer: {
      id: 'cust1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      documentType: 'CC',
      documentNumber: '123456789',
      address: '123 Main St',
      city: 'Test City',
      country: 'Colombia',
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    product: {
      id: 'prod1',
      name: 'Test Product',
      description: 'Test',
      price: 100000,
      stock: 10,
      imageUrl: 'test.jpg',
      category: 'electronics',
      isActive: true,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    quantity: 1,
    unitPrice: 100000,
    subtotal: 100000,
    baseFee: 2000,
    deliveryFee: 5000,
    total: 107000,
    status: TransactionStatus.APPROVED,
    wompiTransactionId: '',
    paymentReference: 'ref123',
    paymentResponse: '{"status":"APPROVED"}',
    paidAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDelivery: Delivery = {
    id: '1',
    transaction: mockTransaction,
    fullName: 'John Doe',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
    department: 'Test Dept',
    postalCode: '12345',
    notes: 'Leave at door',
    status: DeliveryStatus.PENDING,
    estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: CreateDeliveryDto = {
    fullName: 'John Doe',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
    department: 'Test Dept',
    notes: 'Leave at door',
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: DELIVERY_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of deliveries', async () => {
      const deliveries = [mockDelivery];
      mockRepository.findAll.mockResolvedValue(deliveries);

      const result = await service.findAll();

      expect(result).toEqual(deliveries);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a delivery when found', async () => {
      mockRepository.findById.mockResolvedValue(mockDelivery);

      const result = await service.findById('1');

      expect(result).toEqual(mockDelivery);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('findByTransactionId', () => {
    it('should return delivery by transaction ID', async () => {
      mockRepository.findByTransactionId.mockResolvedValue(mockDelivery);

      const result = await service.findByTransactionId('txn1');

      expect(result).toEqual(mockDelivery);
      expect(mockRepository.findByTransactionId).toHaveBeenCalledWith('txn1');
    });

    it('should return null if no delivery found', async () => {
      mockRepository.findByTransactionId.mockResolvedValue(null);

      const result = await service.findByTransactionId('txn999');

      expect(result).toBeNull();
    });
  });

  describe('findByStatus', () => {
    it('should return deliveries by status', async () => {
      const deliveries = [mockDelivery];
      mockRepository.findByStatus.mockResolvedValue(deliveries);

      const result = await service.findByStatus(DeliveryStatus.PENDING);

      expect(result).toEqual(deliveries);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(
        DeliveryStatus.PENDING,
      );
    });
  });

  describe('create', () => {
    it('should create a new delivery with default estimated date', async () => {
      mockRepository.create.mockResolvedValue(mockDelivery);

      const result = await service.create(mockTransaction, mockCreateDto);

      expect(result).toEqual(mockDelivery);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: mockTransaction,
          fullName: mockCreateDto.fullName,
          address: mockCreateDto.address,
          city: mockCreateDto.city,
          status: DeliveryStatus.PENDING,
          estimatedDeliveryDate: expect.any(Date),
        }),
      );
    });

    it('should create a delivery with custom estimated date', async () => {
      const customDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dtoWithDate: CreateDeliveryDto = {
        ...mockCreateDto,
        estimatedDeliveryDate: customDate.toISOString(),
      };

      mockRepository.create.mockResolvedValue(mockDelivery);

      await service.create(mockTransaction, dtoWithDate);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDeliveryDate: expect.any(Date),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an existing delivery', async () => {
      const updateDto = { status: DeliveryStatus.IN_TRANSIT };
      const updatedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.IN_TRANSIT,
      };

      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.update.mockResolvedValue(updatedDelivery);

      const result = await service.update('1', updateDto);

      expect(result.status).toBe(DeliveryStatus.IN_TRANSIT);
      expect(mockRepository.update).toHaveBeenCalledWith(
        '1',
        expect.any(Object),
      );
    });

    it('should auto-set deliveredAt when status is DELIVERED', async () => {
      const updateDto = { status: DeliveryStatus.DELIVERED };

      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.update.mockResolvedValue({
        ...mockDelivery,
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
      });

      await service.update('1', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: DeliveryStatus.DELIVERED,
          deliveredAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent delivery', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('999', { status: DeliveryStatus.IN_TRANSIT }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status', async () => {
      const updatedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.DELIVERED,
      };

      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.update.mockResolvedValue(updatedDelivery);

      const result = await service.updateStatus('1', DeliveryStatus.DELIVERED);

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
    });
  });

  describe('delete', () => {
    it('should delete an existing delivery', async () => {
      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when deleting non-existent delivery', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
