import {
  Transaction,
  TransactionStatus,
} from './domain/entities/transaction.entity';
import { CreateTransactionDto } from './application/dto/create-transaction.dto';
import { ProcessPaymentDto } from './application/dto/process-payment.dto';
import { WebhookEventDto } from './application/dto/webhook-event.dto';
import { Customer } from '../customers/domain/entities/customer.entity';
import { Product } from '../products/domain/entities/product.entity';
import {
  Delivery,
  DeliveryStatus,
} from '../deliveries/domain/entities/delivery.entity';

export const mockCustomer: Customer = {
  id: '123e4567-e89b-12d3-a456-426614174111',
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
};

export const mockProduct: Product = {
  id: '123e4567-e89b-12d3-a456-426614174222',
  name: 'Test Product',
  description: 'A test product',
  price: 100000,
  stock: 10,
  imageUrl: 'https://example.com/image.jpg',
  category: 'electronics',
  isActive: true,
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockDelivery: Partial<Delivery> = {
  id: '123e4567-e89b-12d3-a456-426614174333',
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

export const mockTransaction: Partial<Transaction> = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  customer: mockCustomer,
  product: mockProduct,
  delivery: mockDelivery as Delivery,
  quantity: 2,
  unitPrice: 100000,
  subtotal: 200000,
  baseFee: 2000,
  deliveryFee: 5000,
  total: 207000,
  status: TransactionStatus.PENDING,
  wompiTransactionId: null,
  paymentReference: 'ref123',
  paymentResponse: null,
  paidAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockTransactionApproved: Partial<Transaction> = {
  ...mockTransaction,
  status: TransactionStatus.APPROVED,
  wompiTransactionId: 'wompi-123',
  paymentResponse: JSON.stringify({ id: 'wompi-123', status: 'APPROVED' }),
  paidAt: new Date('2026-01-01'),
};

export const mockCreateTransactionDto: CreateTransactionDto = {
  customerId: mockCustomer.id,
  productId: mockProduct.id,
  quantity: 2,
};

export const mockProcessPaymentDto: ProcessPaymentDto = {
  cardNumber: '4242424242424242',
  cardExpMonth: '12',
  cardExpYear: '28',
  cardCvc: '123',
  cardHolder: 'John Doe',
  installments: 1,
};

export const mockWebhookEventDto: WebhookEventDto = {
  event: 'transaction.updated',
  data: {
    transaction: {
      id: 'wompi-123',
      amount_in_cents: 207000,
      reference: 'txn-ref-001',
      customer_email: 'john@example.com',
      currency: 'COP',
      payment_method_type: 'CARD',
      status: 'APPROVED',
    },
  },
  environment: 'test',
  signature: {
    properties: ['transaction.id', 'transaction.status'],
    checksum: 'abc123',
  },
  timestamp: 1700000000,
  sent_at: '2026-03-01T00:00:00.000Z',
};

export const mockCardData = {
  number: '4242424242424242',
  cvc: '123',
  exp_month: '12',
  exp_year: '28',
  card_holder: 'John Doe',
};

export const mockWompiTransactionData = {
  acceptance_token: 'acc_token',
  amount_in_cents: 207000,
  currency: 'COP',
  customer_email: 'john@example.com',
  reference: 'ref-001',
  payment_method: { type: 'CARD', installments: 1, token: 'tok_123' },
};
