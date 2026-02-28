import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../../domain/entities/delivery.entity';
import { IDeliveryRepository } from '../../domain/repositories/delivery.repository.interface';

@Injectable()
export class DeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repository: Repository<Delivery>,
  ) {}

  async findAll(): Promise<Delivery[]> {
    return this.repository.find({
      relations: ['transaction'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Delivery | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['transaction'],
    });
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    return this.repository.findOne({
      where: { transaction: { id: transactionId } },
      relations: ['transaction'],
    });
  }

  async findByStatus(status: string): Promise<Delivery[]> {
    return this.repository.find({
      where: { status: status as Delivery['status'] },
      relations: ['transaction'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(deliveryData: Partial<Delivery>): Promise<Delivery> {
    const delivery = this.repository.create(deliveryData);
    return this.repository.save(delivery);
  }

  async update(id: string, deliveryData: Partial<Delivery>): Promise<Delivery> {
    await this.repository.update(id, deliveryData);
    const delivery = await this.findById(id);
    if (!delivery) {
      throw new Error('Delivery not found after update');
    }
    return delivery;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
