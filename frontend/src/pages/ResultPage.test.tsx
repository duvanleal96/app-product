import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ResultPage } from './ResultPage';
import cartReducer from '../store/cartSlice';
import productsReducer from '../store/productsSlice';
import checkoutReducer from '../store/checkoutSlice';
import type { Product, Transaction, TransactionStatus } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const createMockTransaction = (status: TransactionStatus): Transaction => ({
  id: 'txn-123',
  product: mockProduct,
  customer: {
    id: 'customer-123',
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '3001234567',
    documentType: 'CC',
    documentNumber: '1234567890',
  },
  quantity: 1,
  unitPrice: mockProduct.price,
  subtotal: mockProduct.price,
  baseFee: 5000,
  deliveryFee: 10000,
  total: mockProduct.price + 5000 + 10000,
  status,
  wompiTransactionId: 'wompi-123',
  paymentReference: 'REF123456',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
});

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

describe('ResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when transaction is being processed', () => {
    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: true,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should display approved transaction with success message', () => {
    const approvedTransaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: approvedTransaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/✓ Aprobada/i)).toBeInTheDocument();
    expect(screen.getByText(/¡Pago Exitoso!/i)).toBeInTheDocument();
  });

  it('should display declined transaction with error message', () => {
    const declinedTransaction = createMockTransaction('DECLINED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: declinedTransaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/✗ Rechazada/i)).toBeInTheDocument();
    expect(screen.getByText(/Pago No Exitoso/i)).toBeInTheDocument();
  });

  it('should display pending transaction status', () => {
    const pendingTransaction = createMockTransaction('PENDING');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: pendingTransaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/⏳ Pendiente/i)).toBeInTheDocument();
  });

  it('should display error transaction status', () => {
    const errorTransaction = createMockTransaction('ERROR');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: errorTransaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/⚠ Error/i)).toBeInTheDocument();
  });

  it('should display transaction ID and reference', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText('txn-123')).toBeInTheDocument();
    expect(screen.getByText('REF123456')).toBeInTheDocument();
  });

  it('should display transaction total amount', () => {
    const transaction = createMockTransaction('APPROVED');
    const total = transaction.total;

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(
      screen.getByText(`$ ${total.toLocaleString('es-CO')}`)
    ).toBeInTheDocument();
  });

  it('should display payment reference', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText('REF123456')).toBeInTheDocument();
  });

  it('should display Wompi transaction ID', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText('wompi-123')).toBeInTheDocument();
  });

  it('should clear cart when transaction is approved', () => {
    const transaction = createMockTransaction('APPROVED');

    const { store } = renderWithProviders(<ResultPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    // Cart should be cleared
    const state = store.getState();
    expect(state.cart.items).toHaveLength(0);
  });

  it('should not clear cart when transaction is declined', () => {
    const transaction = createMockTransaction('DECLINED');

    const { store } = renderWithProviders(<ResultPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    // Cart should NOT be cleared for declined transactions
    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
  });

  it('should navigate to home when clicking return button', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    const returnButton = screen.getByRole('button', {
      name: /Volver a la tienda/i,
    });
    fireEvent.click(returnButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show Wompi details toggle button', () => {
    const transaction = {
      ...createMockTransaction('APPROVED'),
      wompiDetails: {
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'REF123456',
        amount_in_cents: 251400000,
        currency: 'COP',
        payment_method: { type: 'CARD' },
      },
    };

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    const toggleButton = screen.getByRole('button', {
      name: /Detalles Técnicos de Wompi/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should toggle Wompi details visibility', () => {
    const transaction = {
      ...createMockTransaction('APPROVED'),
      wompiDetails: {
        id: 'wompi-detail-123',
        status: 'APPROVED',
        reference: 'REF123456',
        amount_in_cents: 251400000,
        currency: 'COP',
        payment_method: { type: 'CARD' },
      },
    };

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    const toggleButton = screen.getByRole('button', {
      name: /Detalles Técnicos de Wompi/i,
    });

    // Initially hidden
    expect(screen.queryByText('wompi-detail-123')).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(toggleButton);
    expect(screen.getByText('wompi-detail-123')).toBeInTheDocument();

    // Click to hide
    fireEvent.click(toggleButton);
    expect(screen.queryByText('wompi-detail-123')).not.toBeInTheDocument();
  });

  it('should render step indicator showing step 4', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText('Confirmación')).toBeInTheDocument();
  });

  it('should show try again button for declined transactions', () => {
    const transaction = createMockTransaction('DECLINED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    const retryButton = screen.getByRole('button', {
      name: /Intentar de nuevo/i,
    });
    expect(retryButton).toBeInTheDocument();
  });

  it('should show next steps message for approved transactions', () => {
    const transaction = createMockTransaction('APPROVED');

    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    expect(screen.getByText(/Próximos pasos:/i)).toBeInTheDocument();
    expect(screen.getByText(/3-5 días hábiles/i)).toBeInTheDocument();
  });

  it('should handle missing transaction gracefully', () => {
    renderWithProviders(<ResultPage />, {
      checkout: {
        customer: null,
        customerId: null,
        deliveryInfo: null,
        cardInfo: null,
        transaction: null,
        loading: false,
        error: null,
        currentStep: 4,
      },
    });

    // Should not crash, might show empty state or error
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  });
});
