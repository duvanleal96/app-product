import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './domain/entities/transaction.entity';
import { TransactionService } from './application/transaction.service';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository.interface';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ProductsModule,
    CustomersModule,
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
  ],
  exports: [TransactionService, TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
