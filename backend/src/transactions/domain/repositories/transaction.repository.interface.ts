import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByCustomerId(customerId: string): Promise<Transaction[]>;
  findByStatus(status: string): Promise<Transaction[]>;
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

export const TRANSACTION_REPOSITORY = Symbol('ITransactionRepository');
