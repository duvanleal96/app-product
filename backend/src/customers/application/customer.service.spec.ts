import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface';
import { Customer } from '../domain/entities/customer.entity';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: any;

  const mockCustomer: Customer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const customers = [mockCustomer];
      mockRepository.findAll.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(result).toEqual(customers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById('1');

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when customer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should return a customer by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
    });
  });

  describe('findOrCreate', () => {
    it('should return existing customer if found', async () => {
      const updatedCustomer = { ...mockCustomer, phone: '1234567890' };
      mockRepository.findByEmail.mockResolvedValue(mockCustomer);
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.findOrCreate({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Test City',
      });

      expect(result).toEqual(updatedCustomer);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create new customer if not found', async () => {
      const newCustomerDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        address: '456 Oak St',
        city: 'New City',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        ...mockCustomer,
        ...newCustomerDto,
      });

      const result = await service.findOrCreate(newCustomerDto);

      expect(result.email).toBe(newCustomerDto.email);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        newCustomerDto.email,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(newCustomerDto);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createDto = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '1112223333',
        address: '789 Pine St',
        city: 'Another City',
      };
      mockRepository.create.mockResolvedValue({
        ...mockCustomer,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result.email).toBe(createDto.email);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing customer', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedCustomer = { ...mockCustomer, ...updateDto };

      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete an existing customer', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
