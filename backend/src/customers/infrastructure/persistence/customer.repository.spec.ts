import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerRepository } from './customer.repository';
import { Customer } from '../../domain/entities/customer.entity';
import { mockCustomer } from '../../test-cases';

describe('CustomerRepository', () => {
  let repository: CustomerRepository;

  const mockTypeormRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<CustomerRepository>(CustomerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of customers ordered by createdAt DESC', async () => {
      const customers = [mockCustomer];
      mockTypeormRepository.find.mockResolvedValue(customers);

      const result = await repository.findAll();

      expect(result).toEqual(customers);
      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no customers exist', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await repository.findById(mockCustomer.id);

      expect(result).toEqual(mockCustomer);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCustomer.id },
      });
    });

    it('should return null when customer not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a customer when found by email', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await repository.findByEmail('john@example.com');

      expect(result).toEqual(mockCustomer);
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null when customer not found by email', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new customer', async () => {
      const customerData: Partial<Customer> = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '9876543210',
        address: '456 Oak Ave',
        city: 'Another City',
      };

      mockTypeormRepository.create.mockReturnValue(mockCustomer);
      mockTypeormRepository.save.mockResolvedValue(mockCustomer);

      const result = await repository.create(customerData);

      expect(result).toEqual(mockCustomer);
      expect(mockTypeormRepository.create).toHaveBeenCalledWith(customerData);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockCustomer);
    });
  });

  describe('update', () => {
    it('should update and return the customer', async () => {
      const updateData: Partial<Customer> = {
        fullName: 'John Updated',
        phone: '5555555555',
      };

      const updatedCustomer = { ...mockCustomer, ...updateData };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(updatedCustomer);

      const result = await repository.update(mockCustomer.id, updateData);

      expect(result).toEqual(updatedCustomer);
      expect(mockTypeormRepository.update).toHaveBeenCalledWith(
        mockCustomer.id,
        updateData,
      );
      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCustomer.id },
      });
    });

    it('should throw error when customer not found after update', async () => {
      const updateData: Partial<Customer> = { fullName: 'John Updated' };

      mockTypeormRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeormRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('999', updateData)).rejects.toThrow(
        'Customer not found after update',
      );
    });
  });

  describe('delete', () => {
    it('should delete a customer by id', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete(mockCustomer.id);

      expect(mockTypeormRepository.delete).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('should not throw error when deleting non-existent customer', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(repository.delete('999')).resolves.not.toThrow();
    });
  });
});
