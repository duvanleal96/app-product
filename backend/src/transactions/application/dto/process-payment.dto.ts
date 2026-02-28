import { IsString, IsOptional, IsObject } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  cardNumber: string;

  @IsString()
  cardExpMonth: string;

  @IsString()
  cardExpYear: string;

  @IsString()
  cardCvc: string;

  @IsString()
  cardHolder: string;

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
