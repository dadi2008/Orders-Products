import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError, AxiosInstance } from "axios";

@Injectable()
export class InventoryApiService {
  private readonly orders: AxiosInstance;
  private readonly products: AxiosInstance;

  constructor(config: ConfigService) {
    this.orders = axios.create({ baseURL: config.get("ORDERS_SERVICE_URL") ?? "http://localhost:3001", timeout: 5000 });
    this.products = axios.create({ baseURL: config.get("PRODUCTS_SERVICE_URL") ?? "http://localhost:3002", timeout: 5000 });
  }

  order(path: string, options?: Record<string, unknown>) { return this.request(this.orders, path, options); }

  product(path: string, options?: Record<string, unknown>) { return this.request(this.products, path, options); }

  private async request<T = unknown>(service: AxiosInstance, path: string, options: Record<string, unknown> = {}): Promise<T> {
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
}
