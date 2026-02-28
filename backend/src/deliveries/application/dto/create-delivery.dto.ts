import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @MaxLength(200)
  fullName: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  address: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;
}
