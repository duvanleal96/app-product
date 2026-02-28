import { Delivery } from '../entities/delivery.entity';

export interface IDeliveryRepository {
  findAll(): Promise<Delivery[]>;
  findById(id: string): Promise<Delivery | null>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  findByStatus(status: string): Promise<Delivery[]>;
  create(delivery: Partial<Delivery>): Promise<Delivery>;
  update(id: string, delivery: Partial<Delivery>): Promise<Delivery>;
  delete(id: string): Promise<void>;
}

export const DELIVERY_REPOSITORY = Symbol('IDeliveryRepository');
