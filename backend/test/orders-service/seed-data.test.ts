import { describe, expect, it, vi } from "vitest";
import { seedOrders, seedUsers } from "../../orders-service/prisma/seed-data";

describe("Initial inventory seed", () => {
  it("adds demo users even when registered users already exist, without replacing existing accounts", async () => {
    const createMany = vi.fn().mockResolvedValue({ count: 20 });
    await seedUsers({ user: { createMany } } as never, "test-password-hash");
    expect(createMany).toHaveBeenCalledWith({
      skipDuplicates: true,
      data: expect.arrayContaining([
        expect.objectContaining({ email: "user1@inventory.local", passwordHash: "test-password-hash" }),
        expect.objectContaining({ email: "user20@inventory.local" }),
      ]),
    });
    expect(createMany.mock.calls[0][0].data).toHaveLength(20);
  });

  it("preserves existing seeded arrivals and returns their actual IDs", async () => {
    const tx = {
      $executeRaw: vi.fn(),
      order: {
        findFirst: vi.fn().mockImplementation(async () => ({ id: 42, description: `inventory-seed:order:${String(tx.order.findFirst.mock.calls.length)}` })),
        create: vi.fn(), update: vi.fn(),
      },
    };
    const prisma = { $transaction: vi.fn((fn) => fn(tx)) };
    const orders = await seedOrders(prisma as never);
    expect(orders.map((order) => order.id)).toEqual([42, 42, 42, 42]);
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
  });
});
