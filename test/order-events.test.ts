import { describe, expect, it, vi } from "vitest";
import { OrderEventsController } from "../backend/products-service/src/products/order-events.controller";

describe("OrderEventsController", () => {
  it("removes products when an order deletion event arrives", async () => {
    const removeByOrder = vi.fn().mockResolvedValue({ count: 2 });
    const controller = new OrderEventsController({ removeByOrder } as never);

    await controller.handleOrderDeleted({
      id: 15,
      occurredAt: "2026-11-02T16:00:00.000Z",
    });

    expect(removeByOrder).toHaveBeenCalledWith(15);
  });

  it("rejects an event without a valid order identifier", async () => {
    const controller = new OrderEventsController({
      removeByOrder: vi.fn(),
    } as never);

    await expect(controller.handleOrderDeleted({ id: "15" })).rejects.toThrow(
      "Invalid inventory.order.deleted event",
    );
  });
});
