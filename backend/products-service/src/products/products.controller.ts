import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}
  @Get() findAll(@Query("type") type?: string) { return this.products.findAll(type); }
  @Get("types") types() { return this.products.findTypes(); }
  @Get("order/:orderId") byOrder(@Param("orderId") orderId: string) { return this.products.findByOrder(Number(orderId)); }
  @Delete("order/:orderId") @HttpCode(HttpStatus.OK) removeByOrder(@Param("orderId") orderId: string) { return this.products.removeByOrder(Number(orderId)); }
}
