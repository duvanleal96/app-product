import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProductListPage } from './ProductListPage';
import productsReducer from '../store/productsSlice';
import cartReducer from '../store/cartSlice';
import checkoutReducer from '../store/checkoutSlice';
import type { Product } from '../types';
import type { Store } from '@reduxjs/toolkit';

// Mock del servicio de productos
vi.mock('../services/products.service', () => ({
  productsApi: {
    getAvailable: vi.fn(),
    getById: vi.fn(),
  },
}));

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop HP Pavilion',
    description: 'Laptop gaming con procesador Intel i7',
    price: 2499000,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    category: 'Laptops',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    description: 'Smartphone con cámara profesional',
    price: 5499000,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
    category: 'Smartphones',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const createTestStore = () =>
  configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
    },
  });

interface RenderOptions {
  store?: Store;
}

const renderWithProviders = (
  component: React.ReactElement,
  { store = createTestStore() }: RenderOptions = {}
) => {
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getAvailable).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<ProductListPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render products after successful fetch', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getAvailable).mockResolvedValueOnce(mockProducts);

    renderWithProviders(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop HP Pavilion')).toBeInTheDocument();
      expect(screen.getByText('iPhone 14 Pro')).toBeInTheDocument();
    });
  });

  it('should display hero section with correct text', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getAvailable).mockResolvedValueOnce(mockProducts);

    renderWithProviders(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Bienvenido a E-Shop')).toBeInTheDocument();
      expect(
        screen.getByText(/Descubre los mejores productos/)
      ).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    const { productsApi } = await import('../services/products.service');
    const errorMessage = 'Network error';
    vi.mocked(productsApi.getAvailable).mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText(/Intentar de nuevo/i)).toBeInTheDocument();
    });
  });

  it('should render correct number of product cards', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getAvailable).mockResolvedValueOnce(mockProducts);

    renderWithProviders(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Laptop HP Pavilion')).toBeInTheDocument();
      expect(screen.getByText('iPhone 14 Pro')).toBeInTheDocument();
      expect(screen.getByText('2 productos disponibles')).toBeInTheDocument();
    });
  });

  it('should display empty state when no products available', async () => {
    const { productsApi } = await import('../services/products.service');
    vi.mocked(productsApi.getAvailable).mockResolvedValueOnce([]);

    renderWithProviders(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('Bienvenido a E-Shop')).toBeInTheDocument();
      expect(screen.getByText(/No hay productos disponibles/i)).toBeInTheDocument();
      expect(screen.getByText('0 productos disponibles')).toBeInTheDocument();
    });
  });
});
