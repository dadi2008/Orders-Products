import { describe, expect, it, vi } from "vitest";
import { ProductsService } from "../../products-service/src/products/products.service";

describe("ProductsService", () => {
  const product = {
    id: 8,
    orderId: 4,
    orderTitle: "Hardware replenishment",
    prices: [],
  };

  it("maps products with their order reference", async () => {
    const prisma = {
      product: {
        findMany: vi.fn().mockResolvedValue([product]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new ProductsService(prisma as never);

    await expect(service.findAll("Monitors")).resolves.toEqual([
      expect.objectContaining({
        order: { id: 4, title: "Hardware replenishment" },
      }),
    ]);
    await expect(service.findByOrder(4)).resolves.toHaveLength(1);
    await expect(service.removeByOrder(4)).resolves.toEqual({ count: 1 });

    expect(prisma.product.findMany).toHaveBeenNthCalledWith(1, {
      where: { type: "Monitors" },
      include: { prices: true },
      orderBy: { receivedAt: "desc" },
    });
    expect(prisma.product.findMany).toHaveBeenNthCalledWith(2, {
      where: { orderId: 4 },
      include: { prices: true },
    });
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 4 },
    });
  });

  it("returns distinct product types and skips an outbox event for an absent product", async () => {
    const transaction = {
      product: { findUnique: vi.fn().mockResolvedValue(null) },
      outboxEvent: { create: vi.fn() },
    };
    const prisma = {
      product: {
        findMany: vi.fn().mockResolvedValue([{ type: "Monitors" }]),
      },
      $transaction: vi.fn((operation) => operation(transaction)),
    };
    const service = new ProductsService(prisma as never);

    await expect(service.findTypes()).resolves.toEqual(["Monitors"]);
    await expect(service.remove(8)).resolves.toBeNull();

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: "asc" },
    });
    expect(transaction.outboxEvent.create).not.toHaveBeenCalled();
  });

  it("deletes a product and stores its domain event in the same transaction", async () => {
    const product = { id: 8, orderId: 3 };
    const transaction = {
      product: {
        findUnique: vi.fn().mockResolvedValue(product),
        delete: vi.fn().mockResolvedValue(product),
      },
      outboxEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn((operation) => operation(transaction)),
    };
    const service = new ProductsService(prisma as never);

    await expect(service.remove(8)).resolves.toEqual(product);
    expect(transaction.product.delete).toHaveBeenCalledWith({
      where: { id: 8 },
    });
    expect(transaction.outboxEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: "inventory.product.deleted",
          key: "8",
          payload: expect.objectContaining({ id: 8, orderId: 3 }),
        }),
      }),
    );
  });

  it("creates a product with selected status, condition and an order reference", async () => {
    const created = {
      id: 9,
      orderId: 4,
      orderTitle: "Приход",
      prices: [{ value: 0, currency: "USD", isDefault: true }],
    };
    const create = vi.fn().mockResolvedValue(created);
    const service = new ProductsService({ product: { create } } as never);

    await expect(
      service.create({
        orderId: 4,
        orderTitle: "Приход",
        title: "Монитор",
        condition: "NEW",
        status: "AVAILABLE",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ order: { id: 4, title: "Приход" } }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: 4,
          orderTitle: "Приход",
          title: "Монитор",
          type: "Мониторы",
          condition: "NEW",
          status: "AVAILABLE",
        }),
        include: { prices: true },
      }),
    );
  });
});
