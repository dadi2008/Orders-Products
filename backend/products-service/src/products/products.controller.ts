import { Controller, Get, Param, Query } from "@nestjs/common";
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
}
