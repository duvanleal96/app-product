import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProductDetailPage } from './ProductDetailPage';
import productsReducer from '../store/productsSlice';
import cartReducer from '../store/cartSlice';
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

vi.mock('../services/products.service', () => ({
  productsApi: {
    getAvailable: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockProduct: Product = {
  id: '123',
  name: 'MacBook Pro 16"',
  description: 'Potente laptop para profesionales',
  price: 8999000,
  stock: 5,
  imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
  category: 'Laptops',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const createTestStore = () =>
  configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
    },
  });

const renderWithRouter = (productId: string) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/product/${productId}`]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter('123');

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render product details after successful fetch', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument();
      expect(
        screen.getByText(/Potente laptop para profesionales/)
      ).toBeInTheDocument();
    });

    // Verify price is displayed (may appear multiple times)
    const prices = screen.getAllByText(/8.999.000/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it('should display stock information', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByText(/5 unidades disponibles/)).toBeInTheDocument();
    });
  });

  it('should allow quantity adjustment within stock limits', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    const plusButton = screen.getByRole('button', { name: /\+/ });
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;

    fireEvent.click(plusButton);
    expect(quantityInput.value).toBe('2');

    fireEvent.click(plusButton);
    expect(quantityInput.value).toBe('3');
  });

  it('should disable plus button when stock limit is reached', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce({ ...mockProduct, stock: 2 });

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    const plusButton = screen.getByRole('button', { name: /\+/ });
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;

    fireEvent.click(plusButton);
    expect(quantityInput.value).toBe('2');

    expect(plusButton).toBeDisabled();
  });

  it('should not allow quantity below 1', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    const minusButton = screen.getByRole('button', { name: /−/ });
    expect(minusButton).toBeDisabled();
  });

  it('should calculate total price correctly', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      const prices = screen.getAllByText(/8.999.000/);
      expect(prices.length).toBeGreaterThan(0);
    });

    const plusButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(plusButton);

    await waitFor(() => {
      const totalPrices = screen.getAllByText(/17.998.000/);
      expect(totalPrices.length).toBeGreaterThan(0);
    });
  });

  it('should navigate to customer info when clicking add to cart', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', {
      name: /CONTINUAR CON LA COMPRA/i,
    });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/customer-info');
  });

  it('should display error message when product not found', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockRejectedValueOnce(new Error('Product not found'));

    renderWithRouter('invalid-id');

    await waitFor(() => {
      expect(screen.getByText('Product not found')).toBeInTheDocument();
      expect(screen.getByText(/Intentar de nuevo/i)).toBeInTheDocument();
    });
  });

  it('should show out of stock message when stock is 0', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce({ ...mockProduct, stock: 0 });

    renderWithRouter('123');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /SIN STOCK DISPONIBLE/i })
      ).toBeDisabled();
    });
  });

  it('should allow navigating back to product list', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct);

    renderWithRouter('123');

    await waitFor(() => {
      expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', {
      name: /Volver a productos/i,
    });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
