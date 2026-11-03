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
import { CreateProductDto } from "products/dto/create-product.dto";
import { ProductsService } from "products/products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get() findAll(@Query("type") type?: string) {
    return this.products.findAll(type);
  }
  @Get("types") types() {
    return this.products.findTypes();
  }
  @Get("order/:orderId") byOrder(@Param("orderId") orderId: string) {
    return this.products.findByOrder(Number(orderId));
  }
  @Post()
  create(@Body() input: CreateProductDto) {
    return this.products.create(input);
  }
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string) {
    return this.products.remove(Number(id));
  }
}
