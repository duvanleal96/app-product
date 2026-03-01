import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  Matches,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{13,19}$/, { message: 'Card number must be 13-19 digits' })
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Expiration month must be 01-12' })
  cardExpMonth: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2}$/, { message: 'Expiration year must be 2 digits (YY)' })
  cardExpYear: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{3,4}$/, { message: 'CVV must be 3-4 digits' })
  cardCvc: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Card holder name must have at least 2 characters' })
  cardHolder: string;

  @IsInt()
  @Type(() => Number)
  @Min(1, { message: 'Installments must be at least 1' })
  @Max(36, { message: 'Installments cannot exceed 36' })
  @IsOptional()
  installments?: number;

  @IsObject()
  @IsOptional()
  deliveryInfo?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    department?: string;
    postalCode?: string;
    notes?: string;
  };
}
