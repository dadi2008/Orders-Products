import "reflect-metadata";
import { Body, Controller, Delete, Get, HttpException, Injectable, Module, Param, Post, Query } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import axios, { AxiosError, AxiosInstance } from "axios";

@Injectable()
export class InventoryApi {
  private readonly orders: AxiosInstance;
  private readonly products: AxiosInstance;

  constructor(config: ConfigService) {
    this.orders = axios.create({ baseURL: config.get("ORDERS_SERVICE_URL") ?? "http://localhost:3001", timeout: 5000 });
    this.products = axios.create({ baseURL: config.get("PRODUCTS_SERVICE_URL") ?? "http://localhost:3002", timeout: 5000 });
  }

  async request<T = unknown>(service: AxiosInstance, path: string, options: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await service.request<T>({ url: path, ...options });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status ?? 503;
        const data = axiosError.response?.data;
        const response = typeof data === "string" || (typeof data === "object" && data !== null) ? data : "Upstream service unavailable";
        throw new HttpException(response, status);
      }
      throw new HttpException("Upstream service unavailable", 503);
    }
  }

  order(path: string, options?: Record<string, unknown>) { return this.request(this.orders, path, options); }
  product(path: string, options?: Record<string, unknown>) { return this.request(this.products, path, options); }
}

@Controller("api")
export class ApiController {
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
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
