import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.repository.create(customerData);
    return this.repository.save(customer);
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    await this.repository.update(id, customerData);
    const customer = await this.findById(id);
    if (!customer) {
      throw new Error('Customer not found after update');
    }
    return customer;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
