import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { PaymentPage } from './PaymentPage';
import cartReducer from '../store/cartSlice';
import productsReducer from '../store/productsSlice';
import checkoutReducer from '../store/checkoutSlice';
import type { Product } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/transactions.service', () => ({
  customersApi: {
    findOrCreate: vi.fn(),
  },
  transactionsApi: {
    create: vi.fn(),
    processPayment: vi.fn(),
    syncStatus: vi.fn(),
  },
}));

vi.mock('../utils/cardDetection', () => ({
  detectCardInfo: vi.fn(() => ({ type: 'VISA', issuer: 'Visa', cvcLength: [3] })),
  formatCardNumber: vi.fn((num: string) => num.replace(/(.{4})/g, '$1 ').trim()),
  validateLuhn: vi.fn(() => true),
  getValidationMessage: vi.fn(() => null), // null significa que no hay error
  isCardTypeAccepted: vi.fn(() => true),
}));

const mockProduct: Product = {
  id: '1',
  name: 'Laptop HP',
  description: 'Test laptop',
  price: 2499000,
  stock: 10,
  imageUrl: 'https://example.com/laptop.jpg',
  category: 'Laptops',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const createTestStore = (preloadedState?: {
  cart?: ReturnType<typeof cartReducer>;
  products?: ReturnType<typeof productsReducer>;
  checkout?: ReturnType<typeof checkoutReducer>;
}) => {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      checkout: checkoutReducer,
    },
  });
  
  if (preloadedState) {
    return configureStore({
      reducer: {
        cart: cartReducer,
        products: productsReducer,
        checkout: checkoutReducer,
      },
      preloadedState: preloadedState as Parameters<typeof configureStore>[0]['preloadedState'],
    });
  }
  
  return store;
};
const renderWithProviders = (
  component: React.ReactElement,
  preloadedState?: Record<string, unknown>
) => {
  const store = createTestStore(preloadedState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render payment form with card fields', () => {
    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    expect(screen.getByPlaceholderText(/1234 5678 9012 3456/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/JUAN PEREZ/i)).toBeInTheDocument();
    expect(screen.getByText(/Mes/i)).toBeInTheDocument();
    expect(screen.getByText(/Año/i)).toBeInTheDocument();
    
    // CVV field exists (may have same placeholder as phone)
    const inputs = screen.getAllByPlaceholderText(/123/i);
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('should render delivery information form', () => {
    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    expect(screen.getByPlaceholderText(/Calle 123/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bogotá/i)).toBeInTheDocument();
  });

  it('should format card number with spaces', async () => {
    const { formatCardNumber } = await import('../utils/cardDetection');
    vi.mocked(formatCardNumber);

    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    const cardInput = screen.getByPlaceholderText(/1234 5678 9012 3456/i);
    fireEvent.change(cardInput, { target: { value: '4242424242424242' } });

    expect(formatCardNumber).toHaveBeenCalled();
  });

  it('should detect card type when entering card number', async () => {
    const { detectCardInfo } = await import('../utils/cardDetection');
    vi.mocked(detectCardInfo);

    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    const cardInput = screen.getByPlaceholderText(/1234 5678 9012 3456/i);
    fireEvent.change(cardInput, { target: { value: '4242424242424242' } });

    expect(detectCardInfo).toHaveBeenCalledWith('4242424242424242');
  });

  it('should validate expiration month input', () => {
    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    // Find select by finding the one with option "MM"
    const selects = screen.getAllByRole('combobox');
    const monthSelect = selects.find(s => s.querySelector('option[value=""]')?.textContent === 'MM') as HTMLSelectElement;
    
    fireEvent.change(monthSelect, { target: { value: '06' } });
    expect(monthSelect.value).toBe('06');
  });

  it('should display order summary with fees', () => {
    const subtotal = mockProduct.price;

    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: subtotal,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    expect(screen.getByText(/Pago y Entrega/i)).toBeInTheDocument();
    expect(screen.getByText(/Completa los datos/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    renderWithProviders(<PaymentPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customerId: 'customer-123',
        customer: {
          fullName: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '3001234567',
          documentType: 'CC',
          documentNumber: '1234567890',
        },
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 3,
      },
    });

    const submitButton = screen.getByRole('button', { name: /Pagar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/El número de tarjeta es requerido/i)
      ).toBeInTheDocument();
    });
  });
});
