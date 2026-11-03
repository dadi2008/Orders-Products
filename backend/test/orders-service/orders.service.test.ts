import { describe, expect, it, vi } from "vitest";
import { OrdersService } from "../../orders-service/src/orders/orders.service";

describe("OrdersService", () => {
  it("reads and creates orders through Prisma", async () => {
    const order = { id: 4, title: "Hardware replenishment" };
    const prisma = {
      order: {
        findMany: vi.fn().mockResolvedValue([order]),
        findUnique: vi.fn().mockResolvedValue(order),
        create: vi.fn().mockResolvedValue(order),
      },
    };
    const service = new OrdersService(prisma as never);

    await expect(service.findAll()).resolves.toEqual([order]);
    await expect(service.findOne(4)).resolves.toEqual(order);
    await expect(service.create({ title: order.title })).resolves.toEqual(
      order,
    );

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
    expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 4 } });
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: { title: order.title },
    });
  });

  it("does not create an outbox event when an order is absent", async () => {
    const transaction = {
      order: { findUnique: vi.fn().mockResolvedValue(null) },
      outboxEvent: { create: vi.fn() },
    };
    const prisma = {
      $transaction: vi.fn((operation) => operation(transaction)),
    };
    const service = new OrdersService(prisma as never);

    await expect(service.remove(9)).resolves.toBeNull();
    expect(transaction.outboxEvent.create).not.toHaveBeenCalled();
  });

  it("deletes an order and stores its domain event in the same transaction", async () => {
    const order = { id: 5, title: "Office equipment delivery" };
    const transaction = {
      order: {
        findUnique: vi.fn().mockResolvedValue(order),
        delete: vi.fn().mockResolvedValue(order),
      },
      outboxEvent: { create: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn((operation) => operation(transaction)),
    };
    const service = new OrdersService(prisma as never);

    await expect(service.remove(5)).resolves.toEqual(order);
    expect(transaction.order.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(transaction.outboxEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: "inventory.order.deleted",
          key: "5",
          payload: expect.objectContaining({ id: 5 }),
        }),
      }),
    );
  });
});
