import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Get() findAll() { return this.orders.findAll(); }
  @Get(":id") findOne(@Param("id") id: string) { return this.orders.findOne(Number(id)); }
  @Post() create(@Body() dto: CreateOrderDto) { return this.orders.create(dto); }
  @Delete(":id") @HttpCode(HttpStatus.OK) remove(@Param("id") id: string) { return this.orders.remove(Number(id)); }
}
