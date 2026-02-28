import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.product)
  transactions: Transaction[];
}
