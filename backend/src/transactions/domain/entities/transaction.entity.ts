import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Product } from '../../../products/domain/entities/product.entity';
import { Customer } from '../../../customers/domain/entities/customer.entity';
import { Delivery } from '../../../deliveries/domain/entities/delivery.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
  VOIDED = 'VOIDED',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ManyToOne(() => Product, 'transactions', { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  baseFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatFee: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ length: 200, nullable: true })
  wompiTransactionId: string;

  @Column({ length: 200, nullable: true })
  paymentReference: string;

  @Column('text', { nullable: true })
  paymentResponse: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @OneToOne(() => Delivery, (delivery) => delivery.transaction)
  delivery: Delivery;
}
