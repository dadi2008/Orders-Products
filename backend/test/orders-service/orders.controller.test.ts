import { describe, expect, it, vi } from "vitest";
import { OrdersController } from "../../orders-service/src/orders/orders.controller";

describe("OrdersController", () => {
  it("delegates all order operations and converts route identifiers", async () => {
    const dto = { title: "Office equipment delivery" };
    const orders = {
      findAll: vi.fn().mockResolvedValue([dto]),
      findOne: vi.fn().mockResolvedValue(dto),
      create: vi.fn().mockResolvedValue(dto),
      remove: vi.fn().mockResolvedValue(dto),
    };
    const controller = new OrdersController(orders as never);

    await expect(controller.findAll()).resolves.toEqual([dto]);
    await expect(controller.findOne("12")).resolves.toEqual(dto);
    await expect(controller.create(dto)).resolves.toEqual(dto);
    await expect(controller.remove("12")).resolves.toEqual(dto);

    expect(orders.findOne).toHaveBeenCalledWith(12);
    expect(orders.create).toHaveBeenCalledWith(dto);
    expect(orders.remove).toHaveBeenCalledWith(12);
  });
});
