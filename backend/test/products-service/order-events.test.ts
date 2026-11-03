import { describe, expect, it, vi } from "vitest";
import { of } from "rxjs";
import { OrderEventsController } from "../../products-service/src/products/order-events.controller";

describe("OrderEventsController", () => {
  it("removes products when an order deletion event arrives", async () => {
    const removeByOrder = vi.fn().mockResolvedValue({ count: 2 });
    const controller = new OrderEventsController(
      { removeByOrder } as never,
      { emit: vi.fn().mockReturnValue(of(undefined)) } as never,
    );

    await controller.handleOrderDeleted({
      id: 15,
      occurredAt: "2026-11-02T16:00:00.000Z",
    });

    expect(removeByOrder).toHaveBeenCalledWith(15);
  });

  it("moves an invalid event to the dead-letter topic", async () => {
    const emit = vi.fn().mockReturnValue(of(undefined));
    const controller = new OrderEventsController(
      {
        removeByOrder: vi.fn(),
      } as never,
      { emit } as never,
    );

    await controller.handleOrderDeleted({ id: "15" });

    expect(emit).toHaveBeenCalledWith(
      "inventory.order.deleted.dlq",
      expect.objectContaining({ key: "invalid" }),
    );
  });

  it("retries a failed product cleanup before moving the event to the DLQ", async () => {
    const removeByOrder = vi.fn().mockRejectedValue(new Error("database down"));
    const emit = vi.fn().mockReturnValue(of(undefined));
    const controller = new OrderEventsController(
      { removeByOrder } as never,
      { emit } as never,
    );

    await controller.handleOrderDeleted({ id: 15 });

    expect(removeByOrder).toHaveBeenCalledTimes(3);
    expect(emit).toHaveBeenCalledWith(
      "inventory.order.deleted.dlq",
      expect.objectContaining({ key: "15" }),
    );
  });
});
