import { Customer } from './domain/entities/customer.entity';
import { CreateCustomerDto } from './application/dto/create-customer.dto';
import { UpdateCustomerDto } from './application/dto/update-customer.dto';

export const mockCustomer: Customer = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Test City',
  documentType: 'CC',
  documentNumber: '123456789',
  country: 'Colombia',
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockCreateCustomerDto: CreateCustomerDto = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Test City',
  documentType: 'CC',
  documentNumber: '123456789',
};

export const mockUpdateCustomerDto: UpdateCustomerDto = {
  fullName: 'John Updated',
  phone: '5555555555',
};
