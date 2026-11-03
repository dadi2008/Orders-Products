import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError, AxiosInstance } from "axios";
import type { CreateOrderInput } from "inventory/graphql/inputs/create-order.input";
import type { CreateProductInput } from "inventory/graphql/inputs/create-product.input";
import type {
  InventoryOrder,
  InventoryProduct,
  InventoryUser,
  InventoryUsersPage,
} from "inventory/types/inventory.types";

interface InventoryOrderRecord {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

type CreateProductRequest = Omit<CreateProductInput, "photo"> & {
  photoUrl?: string;
};

@Injectable()
export class InventoryApiService {
  private readonly orders: AxiosInstance;
  private readonly products: AxiosInstance;

  constructor(config: ConfigService) {
    this.orders = axios.create({
      baseURL: config.get("ORDERS_SERVICE_URL") ?? "http://localhost:3001",
      timeout: 5000,
    });
    this.products = axios.create({
      baseURL: config.get("PRODUCTS_SERVICE_URL") ?? "http://localhost:3002",
      timeout: 5000,
    });
  }

  async findOrders(): Promise<InventoryOrder[]> {
    const orders = await this.request<InventoryOrderRecord[]>(
      this.orders,
      "/orders",
    );
    return Promise.all(orders.map((order) => this.enrichOrder(order)));
  }

  async findOrder(id: number): Promise<InventoryOrder | null> {
    const order = await this.request<InventoryOrderRecord | null>(
      this.orders,
      `/orders/${String(id)}`,
    );
    return order ? this.enrichOrder(order) : null;
  }

  async createOrder(input: CreateOrderInput): Promise<InventoryOrder> {
    const order = await this.request<InventoryOrderRecord>(
      this.orders,
      "/orders",
      {
        method: "POST",
        data: input,
      },
    );
    return this.enrichOrder(order);
  }

  async deleteOrder(id: number): Promise<boolean> {
    const order = await this.request<InventoryOrderRecord | null>(
      this.orders,
      `/orders/${String(id)}`,
      { method: "DELETE" },
    );
    return order !== null;
  }

  async createProduct(input: CreateProductRequest): Promise<InventoryProduct> {
    const order = await this.request<InventoryOrderRecord>(
      this.orders,
      `/orders/${String(input.orderId)}`,
    );
    return this.request<InventoryProduct>(this.products, "/products", {
      method: "POST",
      data: {
        orderId: input.orderId,
        orderTitle: order.title,
        title: input.title,
        serialNumber: input.serialNumber,
        type: input.type,
        condition: input.condition,
        status: input.status,
        photoUrl: input.photoUrl,
      },
    });
  }

  findUsers(page: number, pageSize: number): Promise<InventoryUsersPage> {
    return this.request<InventoryUsersPage>(this.orders, "/users", {
      params: { page, pageSize },
    });
  }

  currentUser(): Promise<InventoryUser | null> {
    return this.request<InventoryUser | null>(this.orders, "/users/current");
  }

  findUserById(id: number): Promise<InventoryUser | null> {
    return this.request<InventoryUser | null>(this.orders, `/users/${String(id)}`);
  }

  registerUser(data: { name: string; email: string; password: string }): Promise<InventoryUser> {
    return this.request<InventoryUser>(this.orders, "/users/auth/register", {
      method: "POST",
      data,
    });
  }

  validateUser(data: { email: string; password: string }): Promise<InventoryUser | null> {
    return this.request<InventoryUser | null>(this.orders, "/users/auth/validate", {
      method: "POST",
      data,
    });
  }

  setRefreshTokenHash(id: number, tokenHash: string | null): Promise<InventoryUser> {
    return this.request<InventoryUser>(
      this.orders,
      `/users/auth/${String(id)}/refresh-token`,
      { method: "PATCH", data: tokenHash ? { tokenHash } : {} },
    );
  }

  hasRefreshToken(id: number, tokenHash: string): Promise<boolean> {
    return this.request<boolean>(
      this.orders,
      `/users/auth/${String(id)}/refresh-token/validate`,
      { method: "POST", data: { tokenHash } },
    );
  }

  updateCurrentUser(id: number, data: {
    name: string;
    avatarUrl?: string;
  }): Promise<InventoryUser> {
    return this.request<InventoryUser>(this.orders, `/users/${String(id)}`, {
      method: "PATCH",
      data,
    });
  }

  findProducts(type?: string): Promise<InventoryProduct[]> {
    return this.request<InventoryProduct[]>(this.products, "/products", {
      params: type ? { type } : undefined,
    });
  }

  findProductTypes(): Promise<string[]> {
    return this.request<string[]>(this.products, "/products/types");
  }

  deleteProduct(id: number): Promise<InventoryProduct | null> {
    return this.request<InventoryProduct | null>(
      this.products,
      `/products/${String(id)}`,
      { method: "DELETE" },
    );
  }

  private async request<T = unknown>(
    service: AxiosInstance,
    path: string,
    options: Record<string, unknown> = {},
  ): Promise<T> {
    try {
      const response = await service.request<T>({ url: path, ...options });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status ?? 503;
        const data = axiosError.response?.data;
        const response =
          typeof data === "string" ||
          (typeof data === "object" && data !== null)
            ? data
            : "Upstream service unavailable";
        throw new HttpException(response, status);
      }
      throw new HttpException("Upstream service unavailable", 503);
    }
  }

  private async enrichOrder(
    order: InventoryOrderRecord,
  ): Promise<InventoryOrder> {
    const products = await this.request<InventoryProduct[]>(
      this.products,
      `/products/order/${String(order.id)}`,
    );
    const totals = products
      .flatMap((product) => product.prices)
      .reduce<Record<string, number>>((result, price) => {
        result[price.currency] =
          (result[price.currency] ?? 0) + Number(price.value);
        return result;
      }, {});
    return { ...order, products, productCount: products.length, totals };
  }
}
