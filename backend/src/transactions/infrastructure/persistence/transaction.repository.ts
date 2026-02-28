import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.repository.find({
      relations: ['product', 'customer', 'delivery'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['product', 'customer', 'delivery'],
    });
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    return this.repository.find({
      where: { customer: { id: customerId } },
      relations: ['product', 'customer', 'delivery'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Transaction[]> {
    return this.repository.find({
      where: { status: status as Transaction['status'] },
      relations: ['product', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create(transactionData);
    return this.repository.save(transaction);
  }

  async update(
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    await this.repository.update(id, transactionData);
    const transaction = await this.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found after update');
    }
    return transaction;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
