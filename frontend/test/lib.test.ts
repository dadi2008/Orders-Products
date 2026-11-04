import { beforeEach, describe, expect, it, vi } from "vitest";
import { inventoryApi } from "lib/api";
import { formatDate, formatLongDate, formatMoney } from "lib/format";
import { sum } from "lib/wasm";
import { order, product } from "./fixtures";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("graphql-request", () => ({
  GraphQLClient: class {
    request = requestMock;
  },
}));

beforeEach(() => {
  requestMock.mockReset();
});

describe("formatters", () => {
  it("formats dates and money for the Russian UI", () => {
    expect(formatDate("2025-01-06T12:09:33.000Z")).toContain("2025");
    expect(formatDate("2025-01-06T12:09:33.000Z", false)).not.toContain("2025");
    expect(formatLongDate("2025-01-06T12:09:33.000Z")).toContain("январ");
    expect(formatMoney(2500.85, "USD")).toContain("2");
  });

  it("sums values through the WebAssembly helper", async () => {
    await expect(sum([10.5, 2.25, -1])).resolves.toBe(11.75);
    await expect(sum([])).resolves.toBe(0);
  });
});

describe("inventory API", () => {
  it("maps GraphQL responses and sends every query and mutation", async () => {
    requestMock.mockResolvedValue({
      orders: [
        {
          ...order,
          totals: [{ currency: "USD", value: 2500.85 }],
        },
      ],
      products: [product],
      productTypes: ["Monitors"],
      createOrder: {
        ...order,
        totals: [{ currency: "USD", value: 2500.85 }],
      },
      deleteOrder: true,
      deleteProduct: true,
    });

    await expect(inventoryApi.getOrders()).resolves.toEqual([order]);
    await expect(inventoryApi.getProducts("Monitors")).resolves.toEqual([
      product,
    ]);
    await expect(inventoryApi.getTypes()).resolves.toEqual(["Monitors"]);
    await expect(
      inventoryApi.createOrder("New order", "Description"),
    ).resolves.toEqual(order);
    await expect(inventoryApi.deleteOrder(1)).resolves.toBeUndefined();
    await expect(inventoryApi.deleteProduct(8)).resolves.toBeUndefined();

    expect(requestMock).toHaveBeenCalledTimes(6);
    expect(requestMock.mock.calls[1]?.[1]).toEqual({ type: "Monitors" });
    expect(requestMock.mock.calls[3]?.[1]).toEqual({
      input: { title: "New order", description: "Description" },
    });
  });

  it("surfaces GraphQL and transport failures", async () => {
    requestMock.mockRejectedValue({
      response: { errors: [{ message: "Service unavailable" }] },
    });

    await expect(inventoryApi.getOrders()).rejects.toThrow(
      "Service unavailable",
    );
  });
});
