import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { InventoryApiService } from "../../gateway/src/inventory/inventory-api.service";

describe("InventoryApiService", () => {
  it("enriches orders and calculates currency totals", async () => {
    const orderClient = { request: vi.fn() };
    const productClient = { request: vi.fn() };
    vi.spyOn(axios, "create")
      .mockReturnValueOnce(orderClient as never)
      .mockReturnValueOnce(productClient as never);
    orderClient.request.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Office equipment delivery",
          createdAt: "2025-01-06T12:09:33.000Z",
        },
      ],
    });
    productClient.request.mockResolvedValue({
      data: [
        {
          id: 2,
          prices: [
            { currency: "USD", value: "100" },
            { currency: "USD", value: 50 },
          ],
        },
      ],
    });
    const service = new InventoryApiService({ get: vi.fn() } as never);

    await expect(service.findOrders()).resolves.toEqual([
      expect.objectContaining({ productCount: 1, totals: { USD: 150 } }),
    ]);
    expect(productClient.request).toHaveBeenCalledWith({
      url: "/products/order/1",
    });
  });

  it("maps upstream errors to HTTP exceptions", async () => {
    const client = { request: vi.fn() };
    vi.spyOn(axios, "create").mockReturnValue(client as never);
    client.request.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: "Not found" },
    });
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true);
    const service = new InventoryApiService({ get: vi.fn() } as never);

    await expect(service.findProductTypes()).rejects.toEqual(
      expect.objectContaining({
        response: "Not found",
        status: 404,
      }),
    );
  });

  it("delegates single-resource reads, writes and product operations", async () => {
    const orderClient = { request: vi.fn() };
    const productClient = { request: vi.fn() };
    vi.spyOn(axios, "create")
      .mockReturnValueOnce(orderClient as never)
      .mockReturnValueOnce(productClient as never);
    const order = {
      id: 3,
      title: "Workstation upgrade",
      createdAt: "2025-03-06T12:09:33.000Z",
    };
    const product = { id: 6, prices: [] };
    orderClient.request.mockImplementation(({ method, data }) => {
      if (method === "DELETE") return Promise.resolve({ data: order });
      if (method === "POST")
        return Promise.resolve({ data: { ...order, ...data } });
      return Promise.resolve({ data: order });
    });
    productClient.request.mockImplementation(({ url, method }) => {
      if (method === "DELETE") return Promise.resolve({ data: product });
      if (url === "/products/types")
        return Promise.resolve({ data: ["Monitors"] });
      if (method === "POST") return Promise.resolve({ data: product });
      if (url === "/products") return Promise.resolve({ data: [product] });
      return Promise.resolve({ data: [product] });
    });
    const service = new InventoryApiService({ get: vi.fn() } as never);

    await expect(service.findOrder(3)).resolves.toEqual(
      expect.objectContaining({ id: 3, productCount: 1 }),
    );
    await expect(service.createOrder({ title: "New order" })).resolves.toEqual(
      expect.objectContaining({ title: "New order" }),
    );
    await expect(service.deleteOrder(3)).resolves.toBe(true);
    await expect(
      service.createProduct({ orderId: 3, title: "Монитор" }),
    ).resolves.toEqual(product);
    await expect(service.findProducts("Monitors")).resolves.toEqual([product]);
    await expect(service.findProductTypes()).resolves.toEqual(["Monitors"]);
    await expect(service.deleteProduct(6)).resolves.toEqual(product);

    expect(orderClient.request).toHaveBeenCalledWith({
      url: "/orders",
      method: "POST",
      data: { title: "New order" },
    });
    expect(productClient.request).toHaveBeenCalledWith({
      url: "/products",
      params: { type: "Monitors" },
    });
    expect(productClient.request).toHaveBeenCalledWith({
      url: "/products",
      method: "POST",
      data: { orderId: 3, orderTitle: "Workstation upgrade", title: "Монитор" },
    });
  });
});
