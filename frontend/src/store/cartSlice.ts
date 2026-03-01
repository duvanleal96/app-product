import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      return {
        items: parsed.items || [],
        total: parsed.total || 0,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return { items: [], total: 0 };
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total,
    }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState: CartState = loadCartFromStorage();

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>
    ) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      state.total = calculateTotal(state.items);
      saveCartToStorage(state); // Persist to localStorage
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item && quantity > 0) {
        item.quantity = quantity;
        state.total = calculateTotal(state.items);
        saveCartToStorage(state); // Persist to localStorage
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      state.total = calculateTotal(state.items);
      saveCartToStorage(state); // Persist to localStorage
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      saveCartToStorage(state); // Persist to localStorage
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
