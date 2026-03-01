import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../../../shared/infrastructure/logger/logger.service';
import { ErrorCode } from '../../../shared/domain/error-codes.enum';
import { CustomException } from '../../../shared/infrastructure/exceptions/custom-exception';
import { wompiConfig } from '../../../config/wompi.config';
import * as crypto from 'crypto';

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

@Injectable()
export class WompiService {
  private readonly logger: LoggerService;
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor() {
    this.logger = new LoggerService();
    this.logger.setContext('WompiService');
    this.baseUrl = wompiConfig.baseUrl;
    this.publicKey = wompiConfig.publicKey;
    this.privateKey = wompiConfig.privateKey;
    this.integritySecret = wompiConfig.integritySecret;

    this.logger.log('Wompi service initialized');
  }

  /**
   * Tokeniza una tarjeta de crédito
   */
  async tokenizeCard(cardData: WompiTokenizeCardRequest): Promise<string> {
    this.logger.logMethodEntry('tokenizeCard', {
      cardHolder: cardData.card_holder,
    });

    try {
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error(
          `Failed to tokenize card: ${error.error?.reason || 'Unknown error'}`,
          JSON.stringify(error),
          'WompiService',
          ErrorCode.PAYMENT_GATEWAY_ERROR,
        );
        throw new CustomException(
          ErrorCode.PAYMENT_GATEWAY_CARD_DECLINED,
          error,
          HttpStatus.BAD_REQUEST,
        );
      }

      const result: WompiTokenizeCardResponse = await response.json();
      this.logger.log(`Card tokenized successfully: ${result.data.id}`);
      this.logger.logMethodExit('tokenizeCard', { tokenId: result.data.id });

      return result.data.id;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error tokenizing card: ${error.message}`,
        error.stack,
        'WompiService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      throw new CustomException(
        ErrorCode.PAYMENT_GATEWAY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene el token de aceptación (acceptance token)
   */
  async getAcceptanceToken(): Promise<string> {
    this.logger.logMethodEntry('getAcceptanceToken');

    try {
      const response = await fetch(
        `${this.baseUrl}/merchants/${this.publicKey}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get acceptance token');
      }

      const result = await response.json();
      const acceptanceToken =
        result.data.presigned_acceptance?.acceptance_token;

      if (!acceptanceToken) {
        throw new Error('Acceptance token not found in response');
      }

      this.logger.log('Acceptance token retrieved successfully');
      this.logger.logMethodExit('getAcceptanceToken');

      return acceptanceToken;
    } catch (error) {
      this.logger.error(
        `Error getting acceptance token: ${error.message}`,
        error.stack,
        'WompiService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      throw new CustomException(
        ErrorCode.PAYMENT_GATEWAY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Crea una transacción de pago
   */
  async createTransaction(
    transactionData: WompiTransactionRequest,
  ): Promise<WompiTransactionResponse> {
    this.logger.logMethodEntry('createTransaction', {
      reference: transactionData.reference,
      amount: transactionData.amount_in_cents,
    });

    try {
      // Generar firma de integridad
      const signature = this.generateIntegritySignature(
        transactionData.reference,
        transactionData.amount_in_cents,
        transactionData.currency,
      );

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify({
          ...transactionData,
          signature: {
            integrity: signature,
          },
        }),
      });

      const result: WompiTransactionResponse = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Transaction failed: ${result.data?.status_message || 'Unknown error'}`,
          JSON.stringify(result),
          'WompiService',
          ErrorCode.TRANSACTION_PAYMENT_FAILED,
        );
        throw new CustomException(
          ErrorCode.TRANSACTION_PAYMENT_FAILED,
          result,
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Transaction created successfully: ${result.data.id}`);
      this.logger.logMethodExit('createTransaction', {
        transactionId: result.data.id,
      });

      return result;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error creating transaction: ${error.message}`,
        error.stack,
        'WompiService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      throw new CustomException(
        ErrorCode.PAYMENT_GATEWAY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Consulta el estado de una transacción
   */
  async getTransaction(
    transactionId: string,
  ): Promise<WompiTransactionResponse> {
    this.logger.logMethodEntry('getTransaction', { transactionId });

    try {
      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new CustomException(
          ErrorCode.TRANSACTION_NOT_FOUND,
          { transactionId },
          HttpStatus.NOT_FOUND,
        );
      }

      const result: WompiTransactionResponse = await response.json();
      this.logger.log(
        `Transaction retrieved: ${transactionId} - Status: ${result.data.status}`,
      );
      this.logger.logMethodExit('getTransaction');

      return result;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error getting transaction: ${error.message}`,
        error.stack,
        'WompiService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      throw new CustomException(
        ErrorCode.PAYMENT_GATEWAY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Genera la firma de integridad para una transacción
   */
  private generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const concatenatedString = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    const hash = crypto
      .createHash('sha256')
      .update(concatenatedString)
      .digest('hex');

    this.logger.debug(
      `Generated integrity signature for reference: ${reference}`,
    );

    return hash;
  }

  /**
   * Verifica la firma de un evento de webhook
   */
  verifyEventSignature(eventData: any, receivedSignature: string): boolean {
    this.logger.logMethodEntry('verifyEventSignature');

    try {
      const concatenatedString = `${eventData.event}${eventData.data.transaction.id}${eventData.sent_at}${wompiConfig.eventsSecret}`;
      const expectedSignature = crypto
        .createHash('sha256')
        .update(concatenatedString)
        .digest('hex');

      const isValid = expectedSignature === receivedSignature;

      if (!isValid) {
        this.logger.warn('Event signature verification failed');
      } else {
        this.logger.log('Event signature verified successfully');
      }

      this.logger.logMethodExit('verifyEventSignature', { isValid });
      return isValid;
    } catch (error) {
      this.logger.error(
        `Error verifying event signature: ${error.message}`,
        error.stack,
        'WompiService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      return false;
    }
  }
}
