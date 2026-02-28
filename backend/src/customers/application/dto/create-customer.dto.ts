import { IsString, IsEmail, MaxLength, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  @MaxLength(50)
  documentType: string;

  @IsString()
  @MaxLength(50)
  documentNumber: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;
}
