import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';
import {
  Transaction,
  TransactionStatus,
} from '../domain/entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProductService } from '../../products/application/product.service';
import { CustomerService } from '../../customers/application/customer.service';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByCustomerId(customerId);
  }

  async findByStatus(status: string): Promise<Transaction[]> {
    return this.transactionRepository.findByStatus(status);
  }

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { productId, customerId, quantity, baseFee, deliveryFee } =
      createTransactionDto;

    const product = await this.productService.findById(productId);
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    const customer = await this.customerService.findById(customerId);

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * quantity;
    const finalBaseFee =
      baseFee || (this.configService.get<number>('fees.baseFee') ?? 2000) / 100;
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

    return transaction;
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    additionalData?: Partial<Transaction>,
  ): Promise<Transaction> {
    await this.findById(id);

    const updateData: Partial<Transaction> = {
      status,
      ...additionalData,
    };

    if (status === TransactionStatus.APPROVED) {
      updateData.paidAt = new Date();
    }

    return this.transactionRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    return this.transactionRepository.delete(id);
  }
}
