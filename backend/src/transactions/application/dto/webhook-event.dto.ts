import { IsString, IsNumber, IsObject, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para validar eventos de webhook recibidos de Wompi
 */

class SignatureDto {
  @IsString({ each: true })
  properties: string[];

  @IsString()
  checksum: string;
}

class TransactionDto {
  @IsString()
  id: string;

  @IsNumber()
  amount_in_cents: number;

  @IsString()
  reference: string;

  @IsString()
  customer_email: string;

  @IsString()
  currency: string;

  @IsString()
  payment_method_type: string;

  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'])
  status: string;
}

class DataDto {
  @ValidateNested()
  @Type(() => TransactionDto)
  transaction: TransactionDto;
}

export class WebhookEventDto {
  @IsString()
  event: string;

  @ValidateNested()
  @Type(() => DataDto)
  @IsObject()
  data: DataDto;

  @IsString()
  @IsIn(['test', 'prod'])
  environment: string;

  @ValidateNested()
  @Type(() => SignatureDto)
  @IsObject()
  signature: SignatureDto;

  @IsNumber()
  timestamp: number;

  @IsString()
  sent_at: string;
}
