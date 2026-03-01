/**
 * Interfaces para manejar eventos de webhook de Wompi
 */

export interface WompiWebhookEvent {
  event: string; // Tipo de evento (ej: "transaction.updated")
  data: WompiWebhookData;
  environment: 'test' | 'prod'; // "test" para Sandbox, "prod" para Producción
  signature: WompiWebhookSignature;
  timestamp: number; // Timestamp UNIX del evento
  sent_at: string; // Fecha ISO cuando se notificó el evento
}

export interface WompiWebhookData {
  transaction: WompiWebhookTransaction;
}

export interface WompiWebhookTransaction {
  id: string; // ID de la transacción en Wompi
  amount_in_cents: number;
  reference: string; // Tu referencia/ID de transacción
  customer_email: string;
  currency: string;
  payment_method_type: string; // CARD, NEQUI, etc.
  redirect_url?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  shipping_address?: any;
  payment_link_id?: string;
  payment_source_id?: string;
}

export interface WompiWebhookSignature {
  properties: string[]; // Lista de propiedades usadas para calcular la firma
  checksum: string; // Hash SHA256 calculado
}

export type WompiEventType = 
  | 'transaction.updated' 
  | 'nequi_token.updated' 
  | 'bancolombia_transfer_token.updated';
