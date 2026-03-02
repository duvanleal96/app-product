import {
  Delivery,
  DeliveryStatus,
} from './domain/entities/delivery.entity';
import { CreateDeliveryDto } from './application/dto/create-delivery.dto';
import { UpdateDeliveryDto } from './application/dto/update-delivery.dto';
import {
  Transaction,
  TransactionStatus,
} from '../transactions/domain/entities/transaction.entity';

export const mockTransaction: Transaction = {
  id: 'txn1',
  customer: {
    id: 'cust1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    documentType: 'CC',
    documentNumber: '123456789',
    address: '123 Main St',
    city: 'Test City',
    country: 'Colombia',
    transactions: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  product: {
    id: 'prod1',
    name: 'Test Product',
    description: 'Test description',
    price: 100000,
    stock: 10,
    imageUrl: 'test.jpg',
    category: 'electronics',
    isActive: true,
    transactions: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  quantity: 1,
  unitPrice: 100000,
  subtotal: 100000,
  baseFee: 2000,
  deliveryFee: 5000,
  total: 107000,
  status: TransactionStatus.APPROVED,
  wompiTransactionId: null,
  paymentReference: 'ref123',
  paymentResponse: '{"status":"APPROVED"}',
  paidAt: new Date('2026-01-01'),
  delivery: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockDelivery: Delivery = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  transaction: mockTransaction,
  fullName: 'John Doe',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Test City',
  department: 'Test Dept',
  postalCode: '12345',
  notes: 'Leave at door',
  status: DeliveryStatus.PENDING,
  estimatedDeliveryDate: new Date('2026-01-05'),
  deliveredAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockCreateDeliveryDto: CreateDeliveryDto = {
  fullName: 'John Doe',
  phone: '1234567890',
  address: '123 Main St',
  city: 'Test City',
  department: 'Test Dept',
  notes: 'Leave at door',
};

export const mockUpdateDeliveryDto: UpdateDeliveryDto = {
  status: DeliveryStatus.IN_TRANSIT,
  address: '456 New St',
  city: 'New City',
};
