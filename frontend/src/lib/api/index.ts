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
  loginMutation,
  logoutMutation,
  refreshSessionMutation,
  registerMutation,
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
const accessTokenKey = "inventory-access-token";
const refreshTokenKey = "inventory-refresh-token";
let accessToken = window.localStorage.getItem(accessTokenKey);
let refreshToken = window.localStorage.getItem(refreshTokenKey);
let refreshTask: Promise<AuthSession | null> | undefined;

type AuthSession = { accessToken: string; refreshToken: string; user: User };

async function request<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    return await client.request<T>(query, variables, authorizationHeader());
  } catch (error: unknown) {
    if (isUnauthorized(error) && (await refreshAccessToken()))
      return client.request<T>(query, variables, authorizationHeader());
    throw new Error(getErrorMessage(error) ?? "Unable to complete the request");
  }
}

function authorizationHeader(): Record<string, string> | undefined {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

function isUnauthorized(error: unknown): boolean {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  return message.includes("unauthorized") || message.includes("jwt") || message.includes("token");
}

async function refreshAccessToken(): Promise<AuthSession | null> {
  if (!refreshToken) return null;
  if (!refreshTask) {
    refreshTask = client
      .request<{ refreshSession: AuthSession }>(refreshSessionMutation, {
        input: { refreshToken },
      })
      .then(({ refreshSession }) => {
        saveSession(refreshSession);
        return refreshSession;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshTask = undefined;
      });
  }
  return refreshTask;
}

function saveSession(session: AuthSession) {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken;
  window.localStorage.setItem(accessTokenKey, accessToken);
  window.localStorage.setItem(refreshTokenKey, refreshToken);
}

function clearSession() {
  accessToken = null;
  refreshToken = null;
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
  invalidateCache();
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
  async login(email: string, password: string): Promise<AuthSession> {
    const data = await client.request<{ login: AuthSession }>(loginMutation, {
      input: { email, password },
    });
    saveSession(data.login);
    return data.login;
  },
  async register(name: string, email: string, password: string): Promise<AuthSession> {
    const data = await client.request<{ register: AuthSession }>(registerMutation, {
      input: { name, email, password },
    });
    saveSession(data.register);
    return data.register;
  },
  restoreSession(): Promise<AuthSession | null> {
    return refreshAccessToken();
  },
  async logout(): Promise<void> {
    try {
      if (accessToken) await client.request(logoutMutation, undefined, authorizationHeader());
    } finally {
      clearSession();
    }
  },
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
