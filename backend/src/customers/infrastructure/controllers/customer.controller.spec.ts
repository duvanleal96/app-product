import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from '../../application/customer.service';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';
import {
  mockCustomer,
  mockCreateCustomerDto,
  mockUpdateCustomerDto,
} from '../../test-cases';

describe('CustomerController', () => {
  let controller: CustomerController;

  const mockCustomerService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findOrCreate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const customers = [mockCustomer];
      mockCustomerService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll();

      expect(result).toEqual(customers);
      expect(mockCustomerService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no customers exist', async () => {
      mockCustomerService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockCustomerService.findById.mockResolvedValue(mockCustomer);

      const result = await controller.findOne(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerService.findById).toHaveBeenCalledWith(
        mockCustomer.id,
      );
    });

    it('should handle when customer is not found', async () => {
      mockCustomerService.findById.mockResolvedValue(null);

      const result = await controller.findOne(
        '123e4567-e89b-12d3-a456-426614174999',
      );

      expect(result).toBeNull();
    });
  });

  describe('findOrCreate', () => {
    it('should find or create a customer', async () => {
      mockCustomerService.findOrCreate.mockResolvedValue(mockCustomer);

      const result = await controller.findOrCreate(mockCreateCustomerDto);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerService.findOrCreate).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const newCustomer = { ...mockCustomer, ...mockCreateCustomerDto };
      mockCustomerService.create.mockResolvedValue(newCustomer);

      const result = await controller.create(mockCreateCustomerDto);

      expect(result).toEqual(newCustomer);
      expect(mockCustomerService.create).toHaveBeenCalledWith(
        mockCreateCustomerDto,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updatedCustomer = { ...mockCustomer, ...mockUpdateCustomerDto };
      mockCustomerService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update(
        mockCustomer.id,
        mockUpdateCustomerDto,
      );

      expect(result).toEqual(updatedCustomer);
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        mockCustomer.id,
        mockUpdateCustomerDto,
      );
    });

    it('should update customer email', async () => {
      const updateDto: UpdateCustomerDto = { email: 'newemail@example.com' };
      const updatedCustomer = { ...mockCustomer, email: updateDto.email };
      mockCustomerService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update(mockCustomer.id, updateDto);

      expect(result.email).toBe(updateDto.email);
    });
  });

  describe('delete', () => {
    it('should delete a customer and return success message', async () => {
      mockCustomerService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockCustomer.id);

      expect(result).toEqual({ message: 'Customer deleted successfully' });
      expect(mockCustomerService.delete).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('should call delete service with correct id', async () => {
      const testId = '123e4567-e89b-12d3-a456-426614174111';
      mockCustomerService.delete.mockResolvedValue(undefined);

      await controller.delete(testId);

      expect(mockCustomerService.delete).toHaveBeenCalledWith(testId);
    });
  });
});
