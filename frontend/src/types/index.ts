// API Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateCustomerDto {
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Transaction {
  id: string;
  product: Product;
  customer: Customer;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  status: TransactionStatus;
  wompiTransactionId?: string;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  wompiDetails?: Record<string, unknown>; // Detalles completos de la respuesta de Wompi
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';

export interface CreateTransactionDto {
  productId: string;
  customerId: string;
  quantity: number;
  baseFee?: number;
  deliveryFee?: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  department?: string;
  postalCode?: string;
  notes?: string;
}

export interface ProcessPaymentDto {
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
  installments?: number;
  deliveryInfo: DeliveryInfo;
}

// Redux State Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutState {
  customer: CreateCustomerDto | null;
  deliveryInfo: DeliveryInfo | null;
  cardInfo: {
    cardNumber: string;
    cardExpMonth: string;
    cardExpYear: string;
    cardCvc: string;
    cardHolder: string;
  } | null;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
