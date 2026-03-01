import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { ICustomerRepository } from '../domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface';
import { Customer } from '../domain/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findByEmail(email);
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.findByEmail(createCustomerDto.email);
    if (existingCustomer) {
      throw new ConflictException(
        `Customer with email ${createCustomerDto.email} already exists`,
      );
    }

    return this.customerRepository.create(createCustomerDto);
  }

  /**
   * Busca un customer por email, si existe lo devuelve, si no existe lo crea
   * Este método permite que un mismo usuario haga múltiples compras
   */
  async findOrCreate(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.findByEmail(createCustomerDto.email);

    if (existingCustomer) {
      // Si el customer ya existe, actualizamos sus datos con la nueva información
      return this.customerRepository.update(
        existingCustomer.id,
        createCustomerDto,
      );
    }

    // Si no existe, creamos uno nuevo
    return this.customerRepository.create(createCustomerDto);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.findById(id); // Verify exists

    if (updateCustomerDto.email) {
      const existingCustomer = await this.findByEmail(updateCustomerDto.email);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException(
          `Email ${updateCustomerDto.email} is already in use`,
        );
      }
    }

    return this.customerRepository.update(id, updateCustomerDto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify exists
    return this.customerRepository.delete(id);
  }
}
