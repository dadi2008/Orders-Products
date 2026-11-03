import { describe, expect, it, vi } from "vitest";
import { InventoryResolver } from "../../gateway/src/inventory/graphql/inventory.resolver";

describe("InventoryResolver", () => {
  it("maps the enriched order to the GraphQL contract", async () => {
    const findOrders = vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "Office equipment delivery",
        description: "Inventory intake",
        createdAt: "2025-01-06T12:09:33.000Z",
        productCount: 1,
        totals: { USD: 2500.85 },
        products: [
          {
            id: 1,
            serialNumber: "SN-123456781",
            title: "ASUS ROG Swift OLED PG27AQDM",
            type: "Monitors",
            condition: "NEW",
            status: "AVAILABLE",
            guaranteeStart: "2025-04-06T00:00:00.000Z",
            guaranteeEnd: "2028-04-06T00:00:00.000Z",
            receivedAt: "2025-01-06T12:09:33.000Z",
            orderId: 1,
            order: { id: 1, title: "Office equipment delivery" },
            prices: [{ value: "2500.85", currency: "USD", isDefault: true }],
          },
        ],
      },
    ]);
    const resolver = new InventoryResolver({ findOrders } as never);

    await expect(resolver.orders()).resolves.toEqual([
      expect.objectContaining({
        totals: [{ currency: "USD", value: 2500.85 }],
        products: [
          expect.objectContaining({ condition: "NEW", status: "AVAILABLE" }),
        ],
      }),
    ]);
  });

  it("delegates the order deletion mutation to the inventory service", async () => {
    const deleteOrder = vi.fn().mockResolvedValue(true);
    const resolver = new InventoryResolver({ deleteOrder } as never);

    await expect(resolver.deleteOrder(5)).resolves.toBe(true);
    expect(deleteOrder).toHaveBeenCalledWith(5);
  });

  it("delegates the product deletion mutation to the inventory service", async () => {
    const deleteProduct = vi.fn().mockResolvedValue(true);
    const resolver = new InventoryResolver({ deleteProduct } as never);

    await expect(resolver.deleteProduct(8)).resolves.toBe(true);
    expect(deleteProduct).toHaveBeenCalledWith(8);
  });

  it("delegates remaining query and mutation operations", async () => {
    const order = {
      id: 2,
      title: "Hardware replenishment",
      createdAt: "2025-02-06T12:09:33.000Z",
      productCount: 0,
      totals: {},
      products: [],
    };
    const inventory = {
      findOrder: vi.fn().mockResolvedValue(order),
      findProducts: vi.fn().mockResolvedValue([]),
      findProductTypes: vi.fn().mockResolvedValue(["Monitors"]),
      createOrder: vi.fn().mockResolvedValue(order),
      createProduct: vi.fn().mockResolvedValue({
        id: 8,
        serialNumber: "SN-8",
        title: "Монитор",
        type: "Мониторы",
        condition: "NEW",
        status: "AVAILABLE",
        guaranteeStart: "2025-01-06T12:09:33.000Z",
        guaranteeEnd: "2028-01-06T12:09:33.000Z",
        receivedAt: "2025-01-06T12:09:33.000Z",
        orderId: 2,
        order: { id: 2, title: order.title },
        prices: [],
      }),
    };
    const resolver = new InventoryResolver(inventory as never);

    await expect(resolver.order(2)).resolves.toEqual(
      expect.objectContaining({ id: 2 }),
    );
    await expect(resolver.products("Monitors")).resolves.toEqual([]);
    await expect(resolver.productTypes()).resolves.toEqual(["Monitors"]);
    await expect(
      resolver.createOrder({ title: "Hardware replenishment" }),
    ).resolves.toEqual(expect.objectContaining({ id: 2 }));
    await expect(
      resolver.createProduct({ orderId: 2, title: "Монитор" }),
    ).resolves.toEqual(expect.objectContaining({ id: 8, title: "Монитор" }));

    expect(inventory.findOrder).toHaveBeenCalledWith(2);
    expect(inventory.findProducts).toHaveBeenCalledWith("Monitors");
    expect(inventory.createOrder).toHaveBeenCalledWith({
      title: "Hardware replenishment",
    });
    expect(inventory.createProduct).toHaveBeenCalledWith({
      orderId: 2,
      title: "Монитор",
    });
  });
});
