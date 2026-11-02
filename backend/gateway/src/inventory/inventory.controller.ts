import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { InventoryApiService } from "./inventory-api.service";

interface Price { currency: string; value: number | string }
interface Product { prices: Price[] }
interface Order { id: number; [key: string]: unknown }

@Controller("api")
export class InventoryController {
  constructor(private readonly api: InventoryApiService) {}

  @Get("health")
  health() { return { status: "ok" }; }

  @Get("orders")
  async orders() {
    const orders = await this.api.order<Order[]>("/orders");
    return Promise.all(orders.map((order) => this.enrichOrder(order)));
  }

  @Get("orders/:id")
  async order(@Param("id") id: string) {
    const order = await this.api.order<Order | null>(`/orders/${id}`);
    return order ? this.enrichOrder(order) : null;
  }

  @Post("orders")
  createOrder(@Body() body: unknown) { return this.api.order("/orders", { method: "POST", data: body }); }

  @Delete("orders/:id")
  @HttpCode(HttpStatus.OK)
  async deleteOrder(@Param("id") id: string) {
    const deletedOrder = await this.api.order(`/orders/${id}`, { method: "DELETE" });
    await this.api.product(`/products/order/${id}`, { method: "DELETE" });
    return deletedOrder;
  }

  @Get("products")
  products(@Query("type") type?: string) { return this.api.product("/products", { params: type ? { type } : undefined }); }

  @Get("products/types")
  types() { return this.api.product("/products/types"); }

  @Get("products/order/:orderId")
  productsByOrder(@Param("orderId") orderId: string) { return this.api.product(`/products/order/${orderId}`); }

  private async enrichOrder(order: Order) {
    const products = await this.api.product<Product[]>(`/products/order/${String(order.id)}`);
    const totals = products.flatMap((product) => product.prices).reduce<Record<string, number>>((result, price) => {
      result[price.currency] = (result[price.currency] ?? 0) + Number(price.value);
      return result;
    }, {});
    return { ...order, products, productCount: products.length, totals };
  }
}
