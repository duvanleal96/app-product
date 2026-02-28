import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { DeliveryService } from '../../application/delivery.service';
import { UpdateDeliveryDto } from '../../application/dto/update-delivery.dto';
import { DeliveryStatus } from '../../domain/entities/delivery.entity';

@Controller('api/deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    if (status) {
      return this.deliveryService.findByStatus(status);
    }
    return this.deliveryService.findAll();
  }

  @Get('transaction/:transactionId')
  async findByTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.deliveryService.findByTransactionId(transactionId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return this.deliveryService.update(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.deliveryService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deliveryService.delete(id);
    return { message: 'Delivery deleted successfully' };
  }
}
