import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CustomerInfoPage } from './CustomerInfoPage';
import cartReducer from '../store/cartSlice';
import productsReducer from '../store/productsSlice';
import checkoutReducer from '../store/checkoutSlice';
import type { Product, Customer } from '../types';

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

const mockCustomer: Customer = {
  id: 'customer-123',
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  documentType: 'CC',
  documentNumber: '1234567890',
  address: 'Calle 123',
  city: 'Bogotá',
  country: 'Colombia',
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

describe('CustomerInfoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render customer form with all required fields', () => {
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo Doc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número/i)).toBeInTheDocument();
  });

  it('should render step indicator showing step 2', () => {
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    expect(screen.getByText('Datos')).toBeInTheDocument();
  });

  it('should show validation error when submitting empty form', async () => {
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/El nombre completo es requerido/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/El email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/El teléfono es requerido/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const { customersApi } = await import('../services/transactions.service');
    
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    // Fill all fields correctly except email
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/Número/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle 123' },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: 'Bogotá' },
    });
    // Email with invalid format
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    // Wait a bit and verify API was not called
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(customersApi.findOrCreate).not.toHaveBeenCalled();
  });

  it('should accept valid email format', async () => {
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/El email no es válido/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should update form fields when typing', () => {
    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    const nameInput = screen.getByLabelText(/Nombre completo/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/Teléfono/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '3001234567' } });

    expect(nameInput.value).toBe('Juan Pérez');
    expect(emailInput.value).toBe('juan@example.com');
    expect(phoneInput.value).toBe('3001234567');
  });

  it('should submit form with valid data', async () => {
    const { customersApi } = await import('../services/transactions.service');
    vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);

    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/Número/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle 123' },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: 'Bogotá' },
    });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(customersApi.findOrCreate).toHaveBeenCalledWith({
        fullName: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '3001234567',
        documentType: 'CC',
        documentNumber: '1234567890',
        address: 'Calle 123',
        city: 'Bogotá',
        country: 'Colombia',
      });
    });
  });

  it('should navigate to payment page after successful submission', async () => {
    const { customersApi } = await import('../services/transactions.service');
    vi.mocked(customersApi.findOrCreate).mockResolvedValueOnce(mockCustomer);

    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/Número/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle 123' },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: 'Bogotá' },
    });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/payment');
    });
  });

  it('should display error message when API call fails', async () => {
    const { customersApi } = await import('../services/transactions.service');
    vi.mocked(customersApi.findOrCreate).mockRejectedValueOnce(
      new Error('Network error')
    );

    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/Número/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle 123' },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: 'Bogotá' },
    });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const { customersApi } = await import('../services/transactions.service');
    vi.mocked(customersApi.findOrCreate).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<CustomerInfoPage />, {
      cart: {
        items: [{ product: mockProduct, quantity: 1 }],
        total: mockProduct.price,
      },
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/Número/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle 123' },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: 'Bogotá' },
    });

    const submitButton = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });


});
