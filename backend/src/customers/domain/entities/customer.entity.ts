import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 50 })
  documentType: string;

  @Column({ length: 50 })
  documentNumber: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions: Transaction[];
}
