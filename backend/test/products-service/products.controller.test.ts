import { describe, expect, it, vi } from "vitest";
import { ProductsController } from "../../products-service/src/products/products.controller";

describe("ProductsController", () => {
  it("delegates product operations and converts route identifiers", async () => {
    const products = {
      findAll: vi.fn().mockResolvedValue([]),
      findTypes: vi.fn().mockResolvedValue(["Monitors"]),
      findByOrder: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 8 }),
      remove: vi.fn().mockResolvedValue({ id: 7 }),
    };
    const controller = new ProductsController(products as never);

    await expect(controller.findAll("Monitors")).resolves.toEqual([]);
    await expect(controller.types()).resolves.toEqual(["Monitors"]);
    await expect(controller.byOrder("4")).resolves.toEqual([]);
    await expect(
      controller.create({
        price: 234,
        orderId: 4,
        orderTitle: "Приход",
        title: "Монитор",
        condition: "NEW",
        status: "AVAILABLE",
      }),
    ).resolves.toEqual({ id: 8 });
    await expect(controller.remove("7")).resolves.toEqual({ id: 7 });

    expect(products.findAll).toHaveBeenCalledWith("Monitors");
    expect(products.findByOrder).toHaveBeenCalledWith(4);
    expect(products.create).toHaveBeenCalledWith({
      price: 234,
      orderId: 4,
      orderTitle: "Приход",
      title: "Монитор",
      condition: "NEW",
      status: "AVAILABLE",
    });
    expect(products.remove).toHaveBeenCalledWith(7);
  });
});
