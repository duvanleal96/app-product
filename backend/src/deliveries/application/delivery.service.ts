import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IDeliveryRepository } from '../domain/repositories/delivery.repository.interface';
import { DELIVERY_REPOSITORY } from '../domain/repositories/delivery.repository.interface';
import { Delivery, DeliveryStatus } from '../domain/entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.findAll();
  }

  async findById(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }
    return delivery;
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    return this.deliveryRepository.findByTransactionId(transactionId);
  }

  async findByStatus(status: string): Promise<Delivery[]> {
    return this.deliveryRepository.findByStatus(status);
  }

  async create(
    transaction: Transaction,
    createDeliveryDto: CreateDeliveryDto,
  ): Promise<Delivery> {
    // Calculate estimated delivery date (3-5 business days)
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 4);

    const estimatedDeliveryDate = createDeliveryDto.estimatedDeliveryDate
      ? new Date(createDeliveryDto.estimatedDeliveryDate)
      : estimatedDate;

    return this.deliveryRepository.create({
      transaction,
      ...createDeliveryDto,
      estimatedDeliveryDate,
      status: DeliveryStatus.PENDING,
    });
  }

  async update(
    id: string,
    updateDeliveryDto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    await this.findById(id); // Verify exists

    const { estimatedDeliveryDate, deliveredAt, ...rest } = updateDeliveryDto;

    const updateData: Partial<Delivery> = {
      ...rest,
      ...(estimatedDeliveryDate
        ? { estimatedDeliveryDate: new Date(estimatedDeliveryDate) }
        : {}),
      ...(deliveredAt ? { deliveredAt: new Date(deliveredAt) } : {}),
      ...(updateDeliveryDto.status === DeliveryStatus.DELIVERED && !deliveredAt
        ? { deliveredAt: new Date() }
        : {}),
    };

    return this.deliveryRepository.update(id, updateData);
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify exists
    return this.deliveryRepository.delete(id);
  }
}
