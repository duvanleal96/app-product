import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from '../../application/delivery.service';
import { UpdateDeliveryDto } from '../../application/dto/update-delivery.dto';
import { DeliveryStatus } from '../../domain/entities/delivery.entity';
import { mockDelivery, mockUpdateDeliveryDto } from '../../test-cases';

describe('DeliveryController', () => {
  let controller: DeliveryController;

  const mockDeliveryService = {
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByTransactionId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: mockDeliveryService,
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all deliveries when no status filter provided', async () => {
      const deliveries = [mockDelivery];
      mockDeliveryService.findAll.mockResolvedValue(deliveries);

      const result = await controller.findAll();

      expect(result).toEqual(deliveries);
      expect(mockDeliveryService.findAll).toHaveBeenCalledTimes(1);
      expect(mockDeliveryService.findByStatus).not.toHaveBeenCalled();
    });

    it('should return deliveries filtered by status when status is provided', async () => {
      const deliveries = [mockDelivery];
      mockDeliveryService.findByStatus.mockResolvedValue(deliveries);

      const result = await controller.findAll(DeliveryStatus.PENDING);

      expect(result).toEqual(deliveries);
      expect(mockDeliveryService.findByStatus).toHaveBeenCalledWith(
        DeliveryStatus.PENDING,
      );
      expect(mockDeliveryService.findAll).not.toHaveBeenCalled();
    });

    it('should return empty array when no deliveries exist', async () => {
      mockDeliveryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByTransaction', () => {
    it('should return delivery by transaction id', async () => {
      const transactionId = '123e4567-e89b-12d3-a456-426614174111';
      mockDeliveryService.findByTransactionId.mockResolvedValue(mockDelivery);

      const result = await controller.findByTransaction(transactionId);

      expect(result).toEqual(mockDelivery);
      expect(mockDeliveryService.findByTransactionId).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should return null when no delivery found for transaction', async () => {
      mockDeliveryService.findByTransactionId.mockResolvedValue(null);

      const result = await controller.findByTransaction(
        '123e4567-e89b-12d3-a456-426614174999',
      );

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a delivery by id', async () => {
      mockDeliveryService.findById.mockResolvedValue(mockDelivery);

      const result = await controller.findOne(mockDelivery.id);

      expect(result).toEqual(mockDelivery);
      expect(mockDeliveryService.findById).toHaveBeenCalledWith(
        mockDelivery.id,
      );
    });
  });

  describe('update', () => {
    it('should update a delivery', async () => {
      const updatedDelivery = { ...mockDelivery, ...mockUpdateDeliveryDto };
      mockDeliveryService.update.mockResolvedValue(updatedDelivery);

      const result = await controller.update(
        mockDelivery.id,
        mockUpdateDeliveryDto,
      );

      expect(result).toEqual(updatedDelivery);
      expect(mockDeliveryService.update).toHaveBeenCalledWith(
        mockDelivery.id,
        mockUpdateDeliveryDto,
      );
    });

    it('should update only the status', async () => {
      const updateDto: UpdateDeliveryDto = { status: DeliveryStatus.DELIVERED };
      const updatedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
      };

      mockDeliveryService.update.mockResolvedValue(updatedDelivery);

      const result = await controller.update(mockDelivery.id, updateDto);

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
      expect(mockDeliveryService.update).toHaveBeenCalledWith(
        mockDelivery.id,
        updateDto,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status via PATCH', async () => {
      const updatedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.IN_TRANSIT,
      };
      mockDeliveryService.updateStatus.mockResolvedValue(updatedDelivery);

      const result = await controller.updateStatus(
        mockDelivery.id,
        DeliveryStatus.IN_TRANSIT,
      );

      expect(result.status).toBe(DeliveryStatus.IN_TRANSIT);
      expect(mockDeliveryService.updateStatus).toHaveBeenCalledWith(
        mockDelivery.id,
        DeliveryStatus.IN_TRANSIT,
      );
    });

    it('should mark delivery as DELIVERED', async () => {
      const updatedDelivery = {
        ...mockDelivery,
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
      };
      mockDeliveryService.updateStatus.mockResolvedValue(updatedDelivery);

      const result = await controller.updateStatus(
        mockDelivery.id,
        DeliveryStatus.DELIVERED,
      );

      expect(result.status).toBe(DeliveryStatus.DELIVERED);
    });
  });

  describe('delete', () => {
    it('should delete a delivery and return success message', async () => {
      mockDeliveryService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockDelivery.id);

      expect(result).toEqual({ message: 'Delivery deleted successfully' });
      expect(mockDeliveryService.delete).toHaveBeenCalledWith(mockDelivery.id);
    });
  });
});
