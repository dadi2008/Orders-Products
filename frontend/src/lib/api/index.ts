import { GraphQLClient } from "graphql-request";
import {
  createOrderMutation,
  createProductMutation,
  currentUserQuery,
  deleteOrderMutation,
  deleteProductMutation,
  ordersQuery,
  productsQuery,
  productTypesQuery,
  updateCurrentUserMutation,
  usersQuery,
} from "common/constants/graphql";
import { graphqlUrl } from "common/constants/environment";
import type { GraphqlOrder } from "common/types/graphql";
import type {
  CreateProductData,
  MediaUpload,
  Order,
  Product,
  User,
  UsersPage,
} from "common/types/inventory";

const client = new GraphQLClient(
  new URL(
    graphqlUrl,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  ).toString(),
);
const cache = new Map<string, { value: unknown; expiresAt: number }>();
const pending = new Map<string, Promise<unknown>>();

async function request<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await client.request<T>(query, variables);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error) ?? "Unable to complete the request");
  }
}

async function cachedRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const key = `${query}:${JSON.stringify(variables ?? {})}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const inFlight = pending.get(key) as Promise<T> | undefined;
  if (inFlight) return inFlight;
  const task = request<T>(query, variables).then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + 30_000 });
    return value;
  });
  pending.set(key, task);
  try {
    return await task;
  } finally {
    pending.delete(key);
  }
}

function invalidateCache() {
  cache.clear();
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error))
    return undefined;
  const { response } = error;
  if (
    typeof response !== "object" ||
    response === null ||
    !("errors" in response)
  )
    return undefined;
  const { errors } = response;
  if (!Array.isArray(errors) || !errors.length) return undefined;
  const [firstError] = errors;
  if (
    typeof firstError !== "object" ||
    firstError === null ||
    !("message" in firstError) ||
    typeof firstError.message !== "string"
  )
    return undefined;
  return firstError.message;
}

export const inventoryApi = {
  async getOrders(): Promise<Order[]> {
    const data = await cachedRequest<{ orders: GraphqlOrder[] }>(ordersQuery);
    return data.orders.map(toOrder);
  },
  async getProducts(type?: string): Promise<Product[]> {
    const data = await cachedRequest<{ products: Product[] }>(productsQuery, {
      type,
    });
    return data.products;
  },
  async getTypes(): Promise<string[]> {
    const data = await cachedRequest<{ productTypes: string[] }>(
      productTypesQuery,
    );
    return data.productTypes;
  },
  async deleteOrder(id: number): Promise<void> {
    await request<{ deleteOrder: boolean }>(deleteOrderMutation, { id });
    invalidateCache();
  },
  async createOrder(title: string, description?: string): Promise<Order> {
    const data = await request<{ createOrder: GraphqlOrder }>(
      createOrderMutation,
      { input: { title, description } },
    );
    invalidateCache();
    return toOrder(data.createOrder);
  },
  async createProduct(data: CreateProductData): Promise<Product> {
    const result = await request<{ createProduct: Product }>(
      createProductMutation,
      { input: data },
    );
    invalidateCache();
    return result.createProduct;
  },
  async getUsers(page: number, pageSize = 10): Promise<UsersPage> {
    const data = await cachedRequest<{ users: UsersPage }>(usersQuery, {
      page,
      pageSize,
    });
    return data.users;
  },
  async getCurrentUser(): Promise<User | null> {
    const data = await cachedRequest<{ currentUser: User | null }>(
      currentUserQuery,
    );
    return data.currentUser;
  },
  async updateCurrentUser(input: {
    name: string;
    avatar?: MediaUpload;
  }): Promise<User> {
    const data = await request<{ updateCurrentUser: User }>(
      updateCurrentUserMutation,
      { input },
    );
    invalidateCache();
    return data.updateCurrentUser;
  },
  async deleteProduct(id: number): Promise<void> {
    await request<{ deleteProduct: boolean }>(deleteProductMutation, { id });
    invalidateCache();
  },
};

function toOrder(order: GraphqlOrder): Order {
  return {
    ...order,
    totals: Object.fromEntries(
      order.totals.map(({ currency, value }) => [currency, value]),
    ),
  };
}
