import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { CartPage } from './CartPage';
import cartReducer from '../store/cartSlice';
import productsReducer from '../store/productsSlice';
import checkoutReducer from '../store/checkoutSlice';
import type { Product, CartItem } from '../types';

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
  name: 'Laptop HP Pavilion',
  description: 'Laptop gaming con procesador Intel i7',
  price: 2499000,
  stock: 10,
  imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
  category: 'Laptops',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCartItem: CartItem = {
  product: mockProduct,
  quantity: 2,
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

describe('CartPage', () => {
  it('should render empty cart message when cart is empty', () => {
    renderWithProviders(<CartPage />, {
      cart: { items: [], total: 0 },
    });

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    expect(
      screen.getByText(/¡Agrega productos para comenzar tu compra!/i)
    ).toBeInTheDocument();
  });

  it('should render cart items when cart has products', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    expect(screen.getByText('Laptop HP Pavilion')).toBeInTheDocument();
    expect(screen.getByText(/Laptop gaming con procesador/i)).toBeInTheDocument();
  });

  it('should display correct item count in header', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    expect(screen.getByText(/1 artículo/i)).toBeInTheDocument();
  });

  it('should display correct item count with multiple items', () => {
    const secondProduct = { ...mockProduct, id: '2', name: 'iPhone 14' };
    renderWithProviders(<CartPage />, {
      cart: {
        items: [
          mockCartItem,
          { product: secondProduct, quantity: 1 },
        ],
        total: mockProduct.price * mockCartItem.quantity + secondProduct.price,
      },
    });

    expect(screen.getByText(/2 artículos/i)).toBeInTheDocument();
  });

  it('should calculate and display subtotal correctly', () => {
    const subtotal = mockProduct.price * mockCartItem.quantity;
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: subtotal,
      },
    });

    const subtotalElements = screen.getAllByText(`$${subtotal.toLocaleString('es-CO')}`);
    expect(subtotalElements.length).toBeGreaterThan(0);
  });

  it('should calculate and display total with fees', () => {
    const subtotal = mockProduct.price * mockCartItem.quantity;
    const BASE_FEE = 5000;
    const DELIVERY_FEE = 10000;
    const totalWithFees = subtotal + BASE_FEE + DELIVERY_FEE;

    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: subtotal,
      },
    });

    expect(
      screen.getByText(`$${totalWithFees.toLocaleString('es-CO')}`)
    ).toBeInTheDocument();
  });

  it('should allow increasing quantity', () => {
    const { store } = renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    const plusButton = screen.getByRole('button', {
      name: /Aumentar cantidad/i,
    });
    fireEvent.click(plusButton);

    const state = store.getState();
    expect(state.cart.items[0].quantity).toBe(3);
  });

  it('should allow decreasing quantity', () => {
    const { store } = renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    const minusButton = screen.getByRole('button', {
      name: /Disminuir cantidad/i,
    });
    fireEvent.click(minusButton);

    const state = store.getState();
    expect(state.cart.items[0].quantity).toBe(1);
  });

  it('should disable plus button when stock limit is reached', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [{ ...mockCartItem, quantity: mockProduct.stock }],
        total: mockProduct.price * mockProduct.stock,
      },
    });

    const plusButton = screen.getByRole('button', {
      name: /Aumentar cantidad/i,
    });
    expect(plusButton).toBeDisabled();
  });

  it('should display stock information', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    expect(screen.getByText(`Stock disponible:`)).toBeInTheDocument();
    expect(screen.getByText(String(mockProduct.stock))).toBeInTheDocument();
  });

  it('should remove item from cart when clicking remove button', () => {
    const { store } = renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    const removeButton = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(removeButton);

    const state = store.getState();
    expect(state.cart.items).toHaveLength(0);
  });

  it('should navigate to customer info when clicking checkout', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    const checkoutButton = screen.getByRole('button', {
      name: /Continuar compra/i,
    });
    fireEvent.click(checkoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/customer-info');
  });

  it('should display product image when available', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    const image = screen.getByAltText('Laptop HP Pavilion') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain(mockProduct.imageUrl);
  });

  it('should display unit price and total price for each item', () => {
    renderWithProviders(<CartPage />, {
      cart: {
        items: [mockCartItem],
        total: mockProduct.price * mockCartItem.quantity,
      },
    });

    // Unit price
    expect(
      screen.getByText(`$${mockProduct.price.toLocaleString('es-CO')} c/u`)
    ).toBeInTheDocument();

    // Total price for item (may appear multiple times)
    const itemTotal = mockProduct.price * mockCartItem.quantity;
    const itemTotalElements = screen.getAllByText(`$${itemTotal.toLocaleString('es-CO')}`);
    expect(itemTotalElements.length).toBeGreaterThan(0);
  });

  it('should navigate to products page when cart is empty and clicking button', () => {
    renderWithProviders(<CartPage />, {
      cart: { items: [], total: 0 },
    });

    const viewProductsButton = screen.getByRole('link', {
      name: /Ver productos/i,
    });
    expect(viewProductsButton).toHaveAttribute('href', '/');
  });
});
