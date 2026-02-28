import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  customerId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsOptional()
  baseFee?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;
}
