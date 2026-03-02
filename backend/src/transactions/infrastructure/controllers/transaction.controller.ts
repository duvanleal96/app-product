import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionService } from '../../application/transaction.service';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { ProcessPaymentDto } from '../../application/dto/process-payment.dto';
import { LoggerService } from '../../../shared/infrastructure/logger/logger.service';

@Controller('api/transactions')
export class TransactionController {
  private readonly logger: LoggerService;

  constructor(private readonly transactionService: TransactionService) {
    this.logger = new LoggerService();
  }

  @Get()
  async findAll(@Query('status') status?: string) {
    if (status) {
      return this.transactionService.findByStatus(status);
    }
    return this.transactionService.findAll();
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.transactionService.findByCustomerId(customerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionService.findById(id);
  }

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Post(':id/process-payment')
  async processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    const transaction = await this.transactionService.processPayment(
      id,
      processPaymentDto,
    );

    let wompiResponse = null;
    if (transaction.paymentResponse) {
      try {
        wompiResponse = JSON.parse(transaction.paymentResponse);
      } catch (e) {
        this.logger.error(
          'Failed to parse paymentResponse in processPayment',
          e instanceof Error ? e.message : String(e),
          'TransactionController',
        );
      }
    }

    return {
      ...transaction,
      wompiDetails: wompiResponse,
    };
  }

  @Post(':id/sync-status')
  async syncPaymentStatus(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.transactionService.syncPaymentStatus(id);

    let wompiResponse = null;
    if (transaction.paymentResponse) {
      try {
        wompiResponse = JSON.parse(transaction.paymentResponse);
      } catch (e) {
        this.logger.error(
          'Failed to parse paymentResponse in syncPaymentStatus',
          e instanceof Error ? e.message : String(e),
          'TransactionController',
        );
      }
    }

    return {
      ...transaction,
      wompiDetails: wompiResponse,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.transactionService.delete(id);
    return { message: 'Transaction deleted successfully' };
  }
}
