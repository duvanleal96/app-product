import { Injectable, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../../../shared/infrastructure/logger/logger.service';
import { ErrorCode } from '../../../shared/domain/error-codes.enum';
import { CustomException } from '../../../shared/infrastructure/exceptions/custom-exception';
import { wompiConfig } from '../../../config/wompi.config';
import * as crypto from 'crypto';
import type {
  WompiTransactionRequest,
  WompiTransactionResponse,
  WompiTokenizeCardRequest,
  WompiTokenizeCardResponse,
} from './wompi.interfaces';

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
          signature: signature,
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
   * Espera y consulta el estado de una transacción con reintentos
   * Útil para transacciones en Sandbox que inicialmente quedan PENDING
   */
  async waitForTransactionStatus(
    transactionId: string,
    maxRetries = 5,
    delayMs = 2000,
  ): Promise<WompiTransactionResponse> {
    this.logger.log(
      `Waiting for transaction ${transactionId} to complete (max ${maxRetries} retries, ${delayMs}ms delay)`,
    );

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Esperar antes de consultar (excepto en el primer intento)
      if (attempt > 1) {
        this.logger.log(
          `Attempt ${attempt}/${maxRetries} - Waiting ${delayMs}ms before checking transaction ${transactionId}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const transaction = await this.getTransaction(transactionId);
      this.logger.log(
        `Transaction ${transactionId} status: ${transaction.data.status} (attempt ${attempt}/${maxRetries})`,
      );

      // Si la transacción ya no está PENDING, retornarla
      if (transaction.data.status !== 'PENDING') {
        this.logger.log(
          `Transaction ${transactionId} completed with status: ${transaction.data.status}`,
        );
        return transaction;
      }
    }

    // Si después de todos los intentos sigue PENDING, retornar el último estado
    this.logger.warn(
      `Transaction ${transactionId} still PENDING after ${maxRetries} attempts`,
    );
    return await this.getTransaction(transactionId);
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
   * Verifica la firma de un evento de webhook según la documentación de Wompi
   * 
   * Pasos según Wompi:
   * 1. Concatenar los valores de los campos especificados en signature.properties
   * 2. Concatenar el timestamp
   * 3. Concatenar el secreto de eventos
   * 4. Calcular SHA256 del resultado
   * 5. Comparar con signature.checksum (o header X-Event-Checksum)
   */
  verifyEventSignature(eventData: any, receivedChecksum?: string): boolean {
    this.logger.logMethodEntry('verifyEventSignature');

    try {
      // Extraer el checksum recibido (del header o del body)
      const checksum = receivedChecksum || eventData.signature.checksum;

      if (!checksum) {
        this.logger.warn('No checksum provided for verification');
        return false;
      }

      // Paso 1: Concatenar los valores de las propiedades especificadas
      let concatenatedValues = '';
      const properties = eventData.signature.properties || [];

      for (const propertyPath of properties) {
        // propertyPath es algo como "transaction.id" o "transaction.status"
        const value = this.getNestedProperty(eventData.data, propertyPath);
        concatenatedValues += value;
      }

      // Paso 2: Concatenar el timestamp
      concatenatedValues += eventData.timestamp;

      // Paso 3: Concatenar el secreto de eventos
      concatenatedValues += wompiConfig.eventsSecret;

      this.logger.debug(`Concatenated string for signature: ${concatenatedValues}`);

      // Paso 4: Calcular SHA256
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(concatenatedValues)
        .digest('hex')
        .toUpperCase(); // Wompi usa uppercase

      // Paso 5: Comparar
      const isValid = expectedChecksum === checksum.toUpperCase();

      if (!isValid) {
        this.logger.warn('Event signature verification failed');
        this.logger.warn(`Expected: ${expectedChecksum}`);
        this.logger.warn(`Received: ${checksum}`);
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

  /**
   * Helper para obtener valores anidados de un objeto usando path notation
   * Ej: "transaction.id" retorna eventData.transaction.id
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
