import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './domain/entities/delivery.entity';
import { DeliveryService } from './application/delivery.service';
import { DeliveryController } from './infrastructure/controllers/delivery.controller';
import { DeliveryRepository } from './infrastructure/persistence/delivery.repository';
import { DELIVERY_REPOSITORY } from './domain/repositories/delivery.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryRepository,
    },
  ],
  exports: [DeliveryService, DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}
