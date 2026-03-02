import { describe, it, expect, beforeEach, vi } from 'vitest';
import cartReducer, { addToCart, updateQuantity, removeFromCart, clearCart } from './cartSlice';
import type { Product } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('cartSlice', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    category: 'electronics',
    imageUrl: 'test.jpg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const state = cartReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      items: [],
      total: 0,
    });
  });

  it('should handle addToCart for new product', () => {
    const initialState = { items: [], total: 0 };
    const state = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe('1');
    expect(state.items[0].quantity).toBe(2);
    expect(state.total).toBe(200000);
  });

  it('should handle addToCart for existing product', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 1 }],
      total: 100000,
    };
    const state = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.total).toBe(300000);
  });

  it('should handle updateQuantity', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
      total: 200000,
    };
    const state = cartReducer(
      initialState,
      updateQuantity({ productId: '1', quantity: 5 })
    );

    expect(state.items[0].quantity).toBe(5);
    expect(state.total).toBe(500000);
  });

  it('should not update quantity if product not found', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
      total: 200000,
    };
    const state = cartReducer(
      initialState,
      updateQuantity({ productId: 'non-existent', quantity: 5 })
    );

    expect(state.items[0].quantity).toBe(2);
    expect(state.total).toBe(200000);
  });

  it('should handle removeFromCart', () => {
    const initialState = {
      items: [{ product: mockProduct, quantity: 2 }],
      total: 200000,
    };
    const state = cartReducer(initialState, removeFromCart('1'));

    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
  });

  it('should handle clearCart', () => {
    const initialState = {
      items: [
        { product: mockProduct, quantity: 2 },
        { product: { ...mockProduct, id: '2' }, quantity: 1 },
      ],
      total: 300000,
    };
    const state = cartReducer(initialState, clearCart());

    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
  });

  it('should save to localStorage on addToCart', () => {
    const initialState = { items: [], total: 0 };
    cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      expect.stringContaining('"items"')
    );
  });

  it('should calculate total correctly with multiple items', () => {
    const product2: Product = { ...mockProduct, id: '2', price: 50000 };
    const initialState = { items: [], total: 0 };
    
    let state = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2 })
    );
    state = cartReducer(
      state,
      addToCart({ product: product2, quantity: 3 })
    );

    expect(state.total).toBe(350000); // (100000 * 2) + (50000 * 3)
  });
});
