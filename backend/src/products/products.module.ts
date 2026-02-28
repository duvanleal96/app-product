import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './domain/entities/product.entity';
import { ProductService } from './application/product.service';
import { ProductController } from './infrastructure/controllers/product.controller';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductService, PRODUCT_REPOSITORY],
})
export class ProductsModule {}
