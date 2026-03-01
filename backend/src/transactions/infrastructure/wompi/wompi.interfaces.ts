export interface WompiPaymentSource {
  type: 'CARD';
  token: string;
  customer_email: string;
  acceptance_token: string;
}

export interface WompiTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  reference: string;
  acceptance_token: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
  };
  redirect_url?: string;
}

export interface WompiTransactionResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: any;
    status: string;
    status_message: string;
    billing_data: any;
    shipping_address: any;
    redirect_url: string;
    payment_source_id: string;
    payment_link_id: string;
    customer_data: any;
  };
}

export interface WompiTokenizeCardRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface WompiTokenizeCardResponse {
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
    expires_at: string;
  };
}
