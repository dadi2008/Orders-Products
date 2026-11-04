import { describe, expect, it, vi, afterEach } from "vitest";
import { WarehousesController } from "../../orders-service/src/warehouses/warehouses.controller";

describe("WarehousesController", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("persists supplied coordinates and trims the address", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    const controller = new WarehousesController({
      warehouse: { create },
    } as never);
    await controller.create({
      name: " Main ",
      address: " Kyiv ",
      latitude: 50.45,
      longitude: 30.52,
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Main",
        address: "Kyiv",
        latitude: 50.45,
        longitude: 30.52,
      },
    });
  });

  it("resolves an address to coordinates before saving", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: () => [{ lat: "50.45", lon: "30.52" }],
        }),
    );
    const controller = new WarehousesController({
      warehouse: { create },
    } as never);
    await controller.create({ name: "Main", address: "Kyiv" });
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Main",
        address: "Kyiv",
        latitude: 50.45,
        longitude: 30.52,
      },
    });
  });

  it("does not save a warehouse when its address cannot be located", async () => {
    const create = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => [] }),
    );
    const controller = new WarehousesController({
      warehouse: { create },
    } as never);
    await expect(
      controller.create({ name: "Main", address: "Unknown" }),
    ).rejects.toThrow("Unable to locate address");
    expect(create).not.toHaveBeenCalled();
  });
});
