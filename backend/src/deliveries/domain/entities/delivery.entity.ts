import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class Delivery extends BaseEntity {
  @OneToOne(() => Transaction, (transaction) => transaction.delivery)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ length: 200 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column('text')
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;
}
