import { MODULE_METADATA } from "@nestjs/common/constants";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { AppModule } from "../../gateway/src/app.module";
import { CreateOrderInput } from "../../gateway/src/inventory/graphql/inputs/create-order.input";
import { InventoryModule } from "../../gateway/src/inventory/inventory.module";

describe("gateway modules", () => {
  it("declares metadata for application and inventory modules", () => {
    for (const module of [AppModule, InventoryModule]) {
      const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module);
      const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module);
      const controllers = Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        module,
      );

      expect(imports ?? providers ?? controllers).toBeDefined();
    }
  });

  it("rejects an invalid create-order input", async () => {
    const input = Object.assign(new CreateOrderInput(), {
      title: "x".repeat(121),
    });

    await expect(validate(input)).resolves.not.toHaveLength(0);
  });
});
