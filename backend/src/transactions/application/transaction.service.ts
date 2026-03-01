import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';
import {
  Transaction,
  TransactionStatus,
} from '../domain/entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ProductService } from '../../products/application/product.service';
import { CustomerService } from '../../customers/application/customer.service';
import { WompiService } from '../infrastructure/wompi/wompi.service';
import { LoggerService } from '../../shared/infrastructure/logger/logger.service';
import { ErrorCode } from '../../shared/domain/error-codes.enum';
import { CustomException } from '../../shared/infrastructure/exceptions/custom-exception';

@Injectable()
export class TransactionService {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
    private readonly configService: ConfigService,
    private readonly wompiService: WompiService,
  ) {
    this.logger = new LoggerService();
    this.logger.setContext('TransactionService');
  }

  async findAll(): Promise<Transaction[]> {
    this.logger.logMethodEntry('findAll');
    try {
      const transactions = await this.transactionRepository.findAll();
      this.logger.log(`Found ${transactions.length} transactions`);
      this.logger.logMethodExit('findAll', { count: transactions.length });
      return transactions;
    } catch (error) {
      this.logger.error(
        `Error finding all transactions: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.DATABASE_QUERY_ERROR,
      );
      throw new CustomException(
        ErrorCode.DATABASE_QUERY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<Transaction> {
    this.logger.logMethodEntry('findById', { id });
    try {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        this.logger.warn(`Transaction not found: ${id}`);
        throw new CustomException(
          ErrorCode.TRANSACTION_NOT_FOUND,
          { id },
          HttpStatus.NOT_FOUND,
        );
      }
      this.logger.log(`Transaction found: ${id}`);
      this.logger.logMethodExit('findById');
      return transaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error finding transaction by ID: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.DATABASE_QUERY_ERROR,
      );
      throw new CustomException(
        ErrorCode.DATABASE_QUERY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    this.logger.logMethodEntry('findByCustomerId', { customerId });
    try {
      const transactions =
        await this.transactionRepository.findByCustomerId(customerId);
      this.logger.log(
        `Found ${transactions.length} transactions for customer ${customerId}`,
      );
      this.logger.logMethodExit('findByCustomerId', {
        count: transactions.length,
      });
      return transactions;
    } catch (error) {
      this.logger.error(
        `Error finding transactions by customer: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.DATABASE_QUERY_ERROR,
      );
      throw new CustomException(
        ErrorCode.DATABASE_QUERY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByStatus(status: string): Promise<Transaction[]> {
    this.logger.logMethodEntry('findByStatus', { status });
    try {
      const transactions =
        await this.transactionRepository.findByStatus(status);
      this.logger.log(
        `Found ${transactions.length} transactions with status ${status}`,
      );
      this.logger.logMethodExit('findByStatus', { count: transactions.length });
      return transactions;
    } catch (error) {
      this.logger.error(
        `Error finding transactions by status: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.DATABASE_QUERY_ERROR,
      );
      throw new CustomException(
        ErrorCode.DATABASE_QUERY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    this.logger.logMethodEntry('create', createTransactionDto);

    try {
      const { productId, customerId, quantity, baseFee, deliveryFee } =
        createTransactionDto;

      // Validar producto y stock
      const product = await this.productService.findById(productId);
      if (product.stock < quantity) {
        this.logger.warn(
          `Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`,
        );
        throw new CustomException(
          ErrorCode.PRODUCT_OUT_OF_STOCK,
          { available: product.stock, requested: quantity },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar cliente
      const customer = await this.customerService.findById(customerId);

      // Calcular montos
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * quantity;
      const finalBaseFee =
        baseFee ||
        (this.configService.get<number>('fees.baseFee') ?? 2000) / 100;
      const finalDeliveryFee =
        deliveryFee ||
        (this.configService.get<number>('fees.deliveryFee') ?? 5000) / 100;
      const total = subtotal + finalBaseFee + finalDeliveryFee;

      const transaction = await this.transactionRepository.create({
        product,
        customer,
        quantity,
        unitPrice,
        subtotal,
        baseFee: finalBaseFee,
        deliveryFee: finalDeliveryFee,
        total,
        status: TransactionStatus.PENDING,
      });

      this.logger.log(`Transaction created successfully: ${transaction.id}`);
      this.logger.logMethodExit('create', { transactionId: transaction.id });

      return transaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error creating transaction: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.TRANSACTION_INVALID_DATA,
      );
      throw new CustomException(
        ErrorCode.TRANSACTION_INVALID_DATA,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Procesa un pago usando Wompi
   */
  async processPayment(
    transactionId: string,
    paymentDto: ProcessPaymentDto,
  ): Promise<Transaction> {
    this.logger.logMethodEntry('processPayment', { transactionId });

    try {
      // Buscar transacción
      const transaction = await this.findById(transactionId);

      // Validar que no esté ya procesada
      if (transaction.status !== TransactionStatus.PENDING) {
        this.logger.warn(
          `Transaction ${transactionId} already processed with status: ${transaction.status}`,
        );
        throw new CustomException(
          ErrorCode.TRANSACTION_ALREADY_PROCESSED,
          { currentStatus: transaction.status },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Tokenizing card for transaction ${transactionId}`);

      // Tokenizar la tarjeta con Wompi
      const cardToken = await this.wompiService.tokenizeCard({
        number: paymentDto.cardNumber,
        cvc: paymentDto.cardCvc,
        exp_month: paymentDto.cardExpMonth,
        exp_year: paymentDto.cardExpYear,
        card_holder: paymentDto.cardHolder,
      });

      this.logger.log(
        `Card tokenized successfully for transaction ${transactionId}`,
      );
      this.logger.log(
        `Getting acceptance token for transaction ${transactionId}`,
      );

      // Obtener token de aceptación
      const acceptanceToken = await this.wompiService.getAcceptanceToken();

      this.logger.log(
        `Creating payment transaction with Wompi for ${transactionId}`,
      );

      // Crear transacción en Wompi
      let wompiTransaction = await this.wompiService.createTransaction({
        amount_in_cents: Math.round(transaction.total * 100), // Convertir a centavos
        currency: 'COP',
        customer_email: transaction.customer.email,
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: paymentDto.installments || 1, // Usar cuotas del DTO o 1 por defecto
        },
        reference: transaction.id,
        acceptance_token: acceptanceToken,
        customer_data: {
          phone_number: transaction.customer.phone,
          full_name: transaction.customer.fullName,
        },
      });

      this.logger.log(
        `Wompi transaction created: ${wompiTransaction.data.id} with initial status: ${wompiTransaction.data.status}`,
      );

      // Si la transacción está PENDING (común en Sandbox), esperar y consultar el estado
      if (wompiTransaction.data.status === 'PENDING') {
        this.logger.log(`Transaction is PENDING, waiting for final status...`);
        wompiTransaction = await this.wompiService.waitForTransactionStatus(
          wompiTransaction.data.id,
          5, // 5 reintentos
          2000, // 2 segundos entre intentos
        );
        this.logger.log(
          `Transaction final status after polling: ${wompiTransaction.data.status}`,
        );
      }

      // Log completo de la respuesta de Wompi para debugging
      this.logger.log(
        `Full Wompi response: ${JSON.stringify(wompiTransaction.data, null, 2)}`,
      );

      // Actualizar el estado de la transacción según la respuesta de Wompi
      let newStatus: TransactionStatus;

      switch (wompiTransaction.data.status) {
        case 'APPROVED':
          newStatus = TransactionStatus.APPROVED;
          // Reducir stock del producto
          await this.productService.reduceStock(
            transaction.product.id,
            transaction.quantity,
          );
          this.logger.log(
            `Stock reduced for product ${transaction.product.id}`,
          );
          break;
        case 'PENDING':
          newStatus = TransactionStatus.PENDING;
          break;
        case 'DECLINED':
          newStatus = TransactionStatus.DECLINED;
          break;
        default:
          newStatus = TransactionStatus.DECLINED;
      }

      // Actualizar transacción con datos de Wompi
      const updatedTransaction = await this.updateStatus(
        transaction.id,
        newStatus,
        {
          wompiTransactionId: wompiTransaction.data.id,
          paymentResponse: JSON.stringify(wompiTransaction.data),
          paidAt:
            newStatus === TransactionStatus.APPROVED ? new Date() : undefined,
        },
      );

      this.logger.log(
        `Transaction ${transactionId} updated with status: ${newStatus}`,
      );
      this.logger.logMethodExit('processPayment', {
        transactionId,
        status: newStatus,
        wompiTransactionId: wompiTransaction.data.id,
      });

      return updatedTransaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error processing payment for transaction ${transactionId}: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.TRANSACTION_PAYMENT_FAILED,
      );
      throw new CustomException(
        ErrorCode.TRANSACTION_PAYMENT_FAILED,
        { transactionId, originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async syncPaymentStatus(transactionId: string): Promise<Transaction> {
    this.logger.logMethodEntry('syncPaymentStatus', { transactionId });

    try {
      // Buscar la transacción
      const transaction = await this.findById(transactionId);

      // Verificar que tenga ID de Wompi
      if (!transaction.wompiTransactionId) {
        this.logger.warn(
          `Transaction ${transactionId} has no Wompi transaction ID`,
        );
        throw new CustomException(
          ErrorCode.TRANSACTION_NOT_FOUND,
          { message: 'Transaction has not been processed with Wompi yet' },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Querying Wompi for transaction ${transaction.wompiTransactionId}`,
      );

      // Consultar estado en Wompi
      const wompiTransaction = await this.wompiService.getTransaction(
        transaction.wompiTransactionId,
      );

      this.logger.log(
        `Wompi status for ${transaction.wompiTransactionId}: ${wompiTransaction.data.status}`,
      );

      // Mapear estado de Wompi a nuestro sistema
      let newStatus: TransactionStatus;
      const previousStatus = transaction.status;

      switch (wompiTransaction.data.status) {
        case 'APPROVED':
          newStatus = TransactionStatus.APPROVED;
          break;
        case 'PENDING':
          newStatus = TransactionStatus.PENDING;
          break;
        case 'DECLINED':
          newStatus = TransactionStatus.DECLINED;
          break;
        case 'ERROR':
          newStatus = TransactionStatus.ERROR;
          break;
        case 'VOIDED':
          newStatus = TransactionStatus.VOIDED;
          break;
        default:
          newStatus = TransactionStatus.ERROR;
      }

      // Si el estado cambió a APPROVED y antes no lo era, reducir stock
      if (
        newStatus === TransactionStatus.APPROVED &&
        previousStatus !== TransactionStatus.APPROVED
      ) {
        this.logger.log(
          `Payment approved, reducing stock for product ${transaction.product.id}`,
        );
        await this.productService.reduceStock(
          transaction.product.id,
          transaction.quantity,
        );
        this.logger.log(`Stock reduced for product ${transaction.product.id}`);
      }

      // Actualizar transacción con el nuevo estado
      const updatedTransaction = await this.updateStatus(
        transaction.id,
        newStatus,
        {
          paymentResponse: JSON.stringify(wompiTransaction.data),
          paidAt:
            newStatus === TransactionStatus.APPROVED
              ? new Date()
              : transaction.paidAt,
        },
      );

      this.logger.log(
        `Transaction ${transactionId} synced with status: ${newStatus}`,
      );
      this.logger.logMethodExit('syncPaymentStatus', {
        transactionId,
        previousStatus,
        newStatus,
      });

      return updatedTransaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error syncing payment status for transaction ${transactionId}: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.PAYMENT_GATEWAY_ERROR,
      );
      throw new CustomException(
        ErrorCode.PAYMENT_GATEWAY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    additionalData?: Partial<Transaction>,
  ): Promise<Transaction> {
    this.logger.logMethodEntry('updateStatus', { id, status });

    try {
      await this.findById(id);

      const updateData: Partial<Transaction> = {
        status,
        ...additionalData,
      };

      if (status === TransactionStatus.APPROVED) {
        updateData.paidAt = new Date();
      }

      const updatedTransaction = await this.transactionRepository.update(
        id,
        updateData,
      );
      this.logger.log(`Transaction ${id} status updated to ${status}`);
      this.logger.logMethodExit('updateStatus');

      return updatedTransaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error updating transaction status: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.TRANSACTION_UPDATE_FAILED,
      );
      throw new CustomException(
        ErrorCode.TRANSACTION_INVALID_STATUS,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Actualiza una transacción basándose en un webhook de Wompi
   * Este método es llamado por el WebhookController cuando Wompi notifica cambios de estado
   */
  async updateTransactionFromWebhook(
    transactionId: string,
    wompiStatus: string,
    wompiTransactionId: string,
    webhookData: any,
  ): Promise<Transaction> {
    this.logger.logMethodEntry('updateTransactionFromWebhook', {
      transactionId,
      wompiStatus,
      wompiTransactionId,
    });

    try {
      // Buscar la transacción
      const transaction = await this.findById(transactionId);

      this.logger.log(
        `Processing webhook for transaction ${transactionId}: ${transaction.status} -> ${wompiStatus}`,
      );

      // Mapear el estado de Wompi a nuestro TransactionStatus
      let newStatus: TransactionStatus;

      switch (wompiStatus) {
        case 'APPROVED':
          newStatus = TransactionStatus.APPROVED;
          // Reducir stock si aún no se ha reducido
          if (
            transaction.status !== TransactionStatus.APPROVED &&
            transaction.product
          ) {
            await this.productService.reduceStock(
              transaction.product.id,
              transaction.quantity,
            );
            this.logger.log(
              `Stock reduced for product ${transaction.product.id} via webhook`,
            );
          }
          break;
        case 'DECLINED':
          newStatus = TransactionStatus.DECLINED;
          break;
        case 'VOIDED':
          newStatus = TransactionStatus.VOIDED;
          break;
        case 'ERROR':
          newStatus = TransactionStatus.ERROR;
          break;
        case 'PENDING':
          newStatus = TransactionStatus.PENDING;
          break;
        default:
          this.logger.warn(`Unknown Wompi status: ${wompiStatus}`);
          newStatus = TransactionStatus.PENDING;
      }

      // Actualizar la transacción
      const updatedTransaction = await this.updateStatus(
        transaction.id,
        newStatus,
        {
          wompiTransactionId: wompiTransactionId,
          paymentResponse: JSON.stringify(webhookData),
          paidAt:
            newStatus === TransactionStatus.APPROVED ? new Date() : undefined,
        },
      );

      this.logger.log(
        `Transaction ${transactionId} updated via webhook to status: ${newStatus}`,
      );
      this.logger.logMethodExit('updateTransactionFromWebhook');

      return updatedTransaction;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error updating transaction from webhook: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.TRANSACTION_UPDATE_FAILED,
      );
      throw new CustomException(
        ErrorCode.TRANSACTION_UPDATE_FAILED,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.logMethodEntry('delete', { id });

    try {
      await this.findById(id);
      await this.transactionRepository.delete(id);
      this.logger.log(`Transaction ${id} deleted successfully`);
      this.logger.logMethodExit('delete');
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error(
        `Error deleting transaction: ${error.message}`,
        error.stack,
        'TransactionService',
        ErrorCode.DATABASE_QUERY_ERROR,
      );
      throw new CustomException(
        ErrorCode.DATABASE_QUERY_ERROR,
        { originalError: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
