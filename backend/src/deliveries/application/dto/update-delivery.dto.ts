import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CreateDeliveryDto } from './create-delivery.dto';
import { DeliveryStatus } from '../../domain/entities/delivery.entity';

type Constructor<T = object> = abstract new (...args: never[]) => T;

const PartialCreateDeliveryDto = (
  PartialType as <T>(classRef: Constructor<T>) => Constructor<Partial<T>>
)(CreateDeliveryDto);

export class UpdateDeliveryDto extends PartialCreateDeliveryDto {
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;

  @IsDateString()
  @IsOptional()
  deliveredAt?: string;
}
