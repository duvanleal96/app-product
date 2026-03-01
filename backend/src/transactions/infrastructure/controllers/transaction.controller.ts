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

@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

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

    // Parsear paymentResponse para incluirlo en la respuesta
    let wompiResponse = null;
    if (transaction.paymentResponse) {
      try {
        wompiResponse = JSON.parse(transaction.paymentResponse);
      } catch (e) {
        // Si no se puede parsear, dejar como null
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

    // Parsear paymentResponse para incluirlo en la respuesta
    let wompiResponse = null;
    if (transaction.paymentResponse) {
      try {
        wompiResponse = JSON.parse(transaction.paymentResponse);
      } catch (e) {
        // Si no se puede parsear, dejar como null
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
