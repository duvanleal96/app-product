import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CUSTOMER_REPOSITORY } from '../domain/repositories/customer.repository.interface';
import {
  mockCustomer,
  mockCreateCustomerDto,
  mockUpdateCustomerDto,
} from '../test-cases';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: any;

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

      const result = await service.findById(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('should throw error when customer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should return a customer by email', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail(mockCustomer.email);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        mockCustomer.email,
      );
    });
  });

  describe('findOrCreate', () => {
    it('should return existing customer if found', async () => {
      const updatedCustomer = { ...mockCustomer, phone: '1234567890' };
      mockRepository.findByEmail.mockResolvedValue(mockCustomer);
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.findOrCreate(mockCreateCustomerDto);

      expect(result).toEqual(updatedCustomer);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        mockCreateCustomerDto.email,
      );
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should create new customer if not found', async () => {
      const newCustomerDto = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '0987654321',
        address: '456 Oak St',
        city: 'New City',
        documentType: 'CC',
        documentNumber: '987654321',
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
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCustomer);

      const result = await service.create(mockCreateCustomerDto);

      expect(result.email).toBe(mockCreateCustomerDto.email);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateCustomerDto);
    });
  });

  describe('update', () => {
    it('should update an existing customer', async () => {
      const updatedCustomer = { ...mockCustomer, ...mockUpdateCustomerDto };

      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(mockCustomer.id, mockUpdateCustomerDto);

      expect(result.fullName).toBe(mockUpdateCustomerDto.fullName);
      expect(mockRepository.update).toHaveBeenCalledWith(mockCustomer.id, mockUpdateCustomerDto);
    });
  });

  describe('delete', () => {
    it('should delete an existing customer', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockCustomer.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCustomer.id);
    });
  });
});
