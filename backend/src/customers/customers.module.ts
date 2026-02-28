import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './domain/entities/customer.entity';
import { CustomerService } from './application/customer.service';
import { CustomerController } from './infrastructure/controllers/customer.controller';
import { CustomerRepository } from './infrastructure/persistence/customer.repository';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
  ],
  exports: [CustomerService, CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
