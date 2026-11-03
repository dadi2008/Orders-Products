import { describe, expect, it } from "vitest";
import { InventoryController } from "../../gateway/src/inventory/inventory.controller";

describe("InventoryController", () => {
  it("returns the health status", () => {
    expect(new InventoryController().health()).toEqual({ status: "ok" });
  });
});
