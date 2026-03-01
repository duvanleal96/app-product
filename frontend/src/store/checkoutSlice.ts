import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { customersApi, transactionsApi } from '../services/transactions.service';
import type {
  CreateCustomerDto,
  DeliveryInfo,
  CreateTransactionDto,
  Transaction,
  ProcessPaymentDto,
} from '../types';

interface CheckoutState {
  customer: CreateCustomerDto | null;
  customerId: string | null;
  deliveryInfo: DeliveryInfo | null;
  cardInfo: {
    cardNumber: string;
    cardExpMonth: string;
    cardExpYear: string;
    cardCvc: string;
    cardHolder: string;
  } | null;
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
}

const initialState: CheckoutState = {
  customer: null,
  customerId: null,
  deliveryInfo: null,
  cardInfo: null,
  transaction: null,
  loading: false,
  error: null,
  currentStep: 1,
};

// Async thunks
export const createCustomer = createAsyncThunk(
  'checkout/createCustomer',
  async (customerData: CreateCustomerDto) => {
    return await customersApi.create(customerData);
  }
);

export const createTransaction = createAsyncThunk(
  'checkout/createTransaction',
  async (transactionData: CreateTransactionDto) => {
    return await transactionsApi.create(transactionData);
  }
);

export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async ({ transactionId, paymentData }: { transactionId: string; paymentData: ProcessPaymentDto }) => {
    return await transactionsApi.processPayment(transactionId, paymentData);
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCustomer: (state, action: PayloadAction<CreateCustomerDto>) => {
      state.customer = action.payload;
    },
    setDeliveryInfo: (state, action: PayloadAction<DeliveryInfo>) => {
      state.deliveryInfo = action.payload;
    },
    setCardInfo: (
      state,
      action: PayloadAction<{
        cardNumber: string;
        cardExpMonth: string;
        cardExpYear: string;
        cardCvc: string;
        cardHolder: string;
      }>
    ) => {
      state.cardInfo = action.payload;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    clearCheckout: () => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerId = action.payload.id;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create customer';
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Payment failed';
      });
  },
});

export const {
  setCustomer,
  setDeliveryInfo,
  setCardInfo,
  setStep,
  nextStep,
  previousStep,
  clearCheckout,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
