import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CreateOrderDto } from "orders/dto/create-order.dto";
import { OrdersService } from "orders/orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Get() findAll(@Query("search") search?: string) {
    return search ? this.orders.findAll(search) : this.orders.findAll();
  }
  @Get(":id") findOne(@Param("id") id: string) {
    return this.orders.findOne(Number(id));
  }
  @Post() create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }
  @Delete(":id") @HttpCode(HttpStatus.OK) remove(@Param("id") id: string) {
    return this.orders.remove(Number(id));
  }
}
