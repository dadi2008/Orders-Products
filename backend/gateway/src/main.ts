import "reflect-metadata";
import { Body, Controller, Delete, Get, HttpException, Injectable, Module, Param, Post, Query } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import axios, { AxiosInstance } from "axios";

@Injectable()
class InventoryApi {
  private readonly orders: AxiosInstance;
  private readonly products: AxiosInstance;

  constructor(config: ConfigService) {
    this.orders = axios.create({ baseURL: config.get("ORDERS_SERVICE_URL") ?? "http://localhost:3001", timeout: 5000 });
    this.products = axios.create({ baseURL: config.get("PRODUCTS_SERVICE_URL") ?? "http://localhost:3002", timeout: 5000 });
  }

  async request(service: AxiosInstance, path: string, options: Record<string, unknown> = {}) {
    try {
      const response = await service.request({ url: path, ...options });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status ?? 503;
      throw new HttpException(error.response?.data ?? "Upstream service unavailable", status);
    }
  }

  order(path: string, options?: Record<string, unknown>) { return this.request(this.orders, path, options); }
  product(path: string, options?: Record<string, unknown>) { return this.request(this.products, path, options); }
}

@Controller("api")
class ApiController {
  constructor(private readonly api: InventoryApi) {}

  @Get("health")
  health() { return { status: "ok" }; }

  @Get("orders")
  orders() { return this.api.order("/orders"); }

  @Get("orders/:id")
  order(@Param("id") id: string) { return this.api.order(`/orders/${id}`); }

  @Post("orders")
  createOrder(@Body() body: unknown) { return this.api.order("/orders", { method: "POST", data: body }); }

  @Delete("orders/:id")
  deleteOrder(@Param("id") id: string) { return this.api.order(`/orders/${id}`, { method: "DELETE" }); }

  @Get("products")
  products(@Query("type") type?: string) { return this.api.product("/products", { params: type ? { type } : undefined }); }

  @Get("products/types")
  types() { return this.api.product("/products/types"); }

  @Get("products/order/:orderId")
  productsByOrder(@Param("orderId") orderId: string) { return this.api.product(`/products/order/${orderId}`); }
}

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true })], controllers: [ApiController], providers: [InventoryApi] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
