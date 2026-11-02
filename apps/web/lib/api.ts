import { Order, Product } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Unable to complete the request");
  return response.json();
}

export const inventoryApi = {
  getOrders: () => request<Order[]>("/orders"),
  getProducts: (type?: string) => request<Product[]>(`/products${type ? `?type=${encodeURIComponent(type)}` : ""}`),
  getTypes: () => request<string[]>("/products/types"),
  deleteOrder: (id: number) => request<Order>(`/orders/${id}`, { method: "DELETE" }),
  createOrder: (title: string, description?: string) => request<Order>("/orders", { method: "POST", body: JSON.stringify({ title, description }) })
};
