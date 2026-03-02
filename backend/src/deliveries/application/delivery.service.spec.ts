import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DELIVERY_REPOSITORY } from '../domain/repositories/delivery.repository.interface';
import { DeliveryStatus } from '../domain/entities/delivery.entity';
import {
  mockTransaction,
  mockDelivery,
  mockCreateDeliveryDto,
} from '../test-cases';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let mockRepository: any;

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

      const result = await service.findById(mockDelivery.id);

      expect(result).toEqual(mockDelivery);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockDelivery.id);
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

      const result = await service.create(mockTransaction, mockCreateDeliveryDto);

      expect(result).toEqual(mockDelivery);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: mockTransaction,
          fullName: mockCreateDeliveryDto.fullName,
          address: mockCreateDeliveryDto.address,
          city: mockCreateDeliveryDto.city,
          status: DeliveryStatus.PENDING,
          estimatedDeliveryDate: expect.any(Date),
        }),
      );
    });

    it('should create a delivery with custom estimated date', async () => {
      const customDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dtoWithDate = {
        ...mockCreateDeliveryDto,
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

      const result = await service.update(mockDelivery.id, updateDto);

      expect(result.status).toBe(DeliveryStatus.IN_TRANSIT);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockDelivery.id,
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

      await service.update(mockDelivery.id, updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockDelivery.id,
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
      const updatedDelivery = { ...mockDelivery, status: DeliveryStatus.DELIVERED };

      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.update.mockResolvedValue(updatedDelivery);

      const result = await service.updateStatus(mockDelivery.id, DeliveryStatus.DELIVERED);

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
    });
  });

  describe('delete', () => {
    it('should delete an existing delivery', async () => {
      mockRepository.findById.mockResolvedValue(mockDelivery);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockDelivery.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockDelivery.id);
    });

    it('should throw NotFoundException when deleting non-existent delivery', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
