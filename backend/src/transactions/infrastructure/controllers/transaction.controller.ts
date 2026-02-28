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

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.transactionService.delete(id);
    return { message: 'Transaction deleted successfully' };
  }
}
