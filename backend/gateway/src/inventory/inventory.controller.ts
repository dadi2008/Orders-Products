import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { InventoryApiService } from "./inventory-api.service";

@Controller("api")
export class InventoryController {
  constructor(private readonly api: InventoryApiService) {}

  @Get("health")
  health() { return { status: "ok" }; }

  @Get("orders")
  orders() { return this.api.order("/orders"); }

  @Get("orders/:id")
  order(@Param("id") id: string) { return this.api.order(`/orders/${id}`); }

  @Post("orders")
  createOrder(@Body() body: unknown) { return this.api.order("/orders", { method: "POST", data: body }); }

  @Delete("orders/:id")
  @HttpCode(HttpStatus.OK)
  deleteOrder(@Param("id") id: string) { return this.api.order(`/orders/${id}`, { method: "DELETE" }); }

  @Get("products")
  products(@Query("type") type?: string) { return this.api.product("/products", { params: type ? { type } : undefined }); }

  @Get("products/types")
  types() { return this.api.product("/products/types"); }

  @Get("products/order/:orderId")
  productsByOrder(@Param("orderId") orderId: string) { return this.api.product(`/products/order/${orderId}`); }
}
