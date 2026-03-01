import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from '../../application/customer.service';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';
import { Customer } from '../../domain/entities/customer.entity';

describe('CustomerController', () => {
  let controller: CustomerController;

  const mockCustomer: Customer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
    city: 'Test City',
    createdAt: new Date(),
    updatedAt: new Date(),
    documentType: '',
    documentNumber: '',
    country: '',
    transactions: [],
  };

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
      const createDto: CreateCustomerDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Test City',
        documentType: '',
        documentNumber: '',
      };

      mockCustomerService.findOrCreate.mockResolvedValue(mockCustomer);

      const result = await controller.findOrCreate(createDto);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerService.findOrCreate).toHaveBeenCalledWith(createDto);
    });
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createDto: CreateCustomerDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Test City',
        documentType: '',
        documentNumber: '',
      };

      const newCustomer = { ...mockCustomer, ...createDto };
      mockCustomerService.create.mockResolvedValue(newCustomer);

      const result = await controller.create(createDto);

      expect(result).toEqual(newCustomer);
      expect(mockCustomerService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto: UpdateCustomerDto = {
        fullName: 'John Updated',
        phone: '5555555555',
      };

      const updatedCustomer = { ...mockCustomer, ...updateDto };
      mockCustomerService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update(mockCustomer.id, updateDto);

      expect(result).toEqual(updatedCustomer);
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        mockCustomer.id,
        updateDto,
      );
    });

    it('should update customer email', async () => {
      const updateDto: UpdateCustomerDto = {
        email: 'newemail@example.com',
      };

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
