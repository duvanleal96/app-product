import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomerService } from '../../application/customer.service';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';

@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customerService.findById(id);
  }

  @Post('find-or-create')
  async findOrCreate(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.findOrCreate(createCustomerDto);
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.customerService.delete(id);
    return { message: 'Customer deleted successfully' };
  }
}
