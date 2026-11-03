import type { ClientKafka } from "@nestjs/microservices";
import { of, throwError } from "rxjs";
import { describe, expect, it, vi } from "vitest";
import { ProductsPrismaService } from "../../products-service/src/database/prisma.service";
import { ProductsOutboxPublisher } from "../../products-service/src/products/outbox/products-outbox.publisher";

const event = {
  id: "event-1",
  topic: "inventory.product.deleted",
  key: "5",
  payload: { id: 5 },
  attempts: 0,
};

interface TestableProductsOutboxPublisher {
  publish: (outboxEvent: typeof event) => Promise<void>;
  claimNext: () => Promise<typeof event | null>;
}

function createPublisher(
  prisma: unknown,
  events: unknown,
): TestableProductsOutboxPublisher {
  return new ProductsOutboxPublisher(
    prisma as ProductsPrismaService,
    events as ClientKafka,
  ) as unknown as TestableProductsOutboxPublisher;
}

describe("ProductsOutboxPublisher", () => {
  it("marks an event as published after Kafka accepts it", async () => {
    const update = vi.fn().mockResolvedValue({});
    const publisher = createPublisher(
      { outboxEvent: { update } },
      { emit: vi.fn().mockReturnValue(of(undefined)) },
    );

    await publisher.publish(event);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event-1" },
        data: expect.objectContaining({ publishedAt: expect.any(Date) }),
      }),
    );
  });

  it("schedules a retry after a publish failure", async () => {
    const update = vi.fn().mockResolvedValue({});
    const publisher = createPublisher(
      { outboxEvent: { update } },
      {
        emit: vi.fn().mockReturnValue(throwError(() => new Error("offline"))),
      },
    );

    await publisher.publish(event);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attempts: 1,
          lastError: "offline",
          availableAt: expect.any(Date),
        }),
      }),
    );
  });

  it("moves an exhausted event to its Kafka DLQ", async () => {
    const update = vi.fn().mockResolvedValue({});
    const emit = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error("offline")))
      .mockReturnValueOnce(of(undefined));
    const publisher = createPublisher({ outboxEvent: { update } }, { emit });

    await publisher.publish({ ...event, attempts: 4 });

    expect(emit).toHaveBeenLastCalledWith(
      "inventory.product.deleted.dlq",
      expect.objectContaining({ key: "5" }),
    );
    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attempts: 5,
          deadLetteredAt: expect.any(Date),
        }),
      }),
    );
  });

  it("claims only an available event", async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(event);
    const updateMany = vi
      .fn()
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });
    const publisher = createPublisher(
      { outboxEvent: { findFirst, updateMany } },
      { emit: vi.fn().mockReturnValue(of(undefined)) },
    );

    await expect(publisher.claimNext()).resolves.toBeNull();
    await expect(publisher.claimNext()).resolves.toBeNull();
    await expect(publisher.claimNext()).resolves.toEqual(event);

    expect(updateMany).toHaveBeenCalledTimes(2);
  });

  it("starts and stops the background publisher", async () => {
    vi.useFakeTimers();
    const findFirst = vi.fn().mockResolvedValue(null);
    const publisher = createPublisher(
      { outboxEvent: { findFirst } },
      { emit: vi.fn().mockReturnValue(of(undefined)) },
    ) as unknown as ProductsOutboxPublisher;

    publisher.onApplicationBootstrap();
    await vi.advanceTimersByTimeAsync(1);
    publisher.onApplicationShutdown();

    expect(findFirst).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
