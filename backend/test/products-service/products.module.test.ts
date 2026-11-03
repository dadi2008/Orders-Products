import { MODULE_METADATA } from "@nestjs/common/constants";
import { describe, expect, it, vi } from "vitest";
import { AppModule } from "../../products-service/src/app.module";
import { DatabaseModule } from "../../products-service/src/database/database.module";
import { getKafkaBrokers } from "../../products-service/src/helpers/kafka";
import { readOrderId } from "../../products-service/src/helpers/order-events";
import { retry } from "../../products-service/src/helpers/retry";
import { ProductsModule } from "../../products-service/src/products/products.module";

describe("products-service modules", () => {
  it("declares metadata for all Nest modules", () => {
    for (const module of [AppModule, DatabaseModule, ProductsModule]) {
      const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module);
      const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module);
      const controllers = Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        module,
      );

      expect(imports ?? providers ?? controllers).toBeDefined();
    }
  });

  it("validates helpers and retries a transient operation", async () => {
    const config = { get: () => "kafka-1:9092, kafka-2:9092 " };
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValue("done");

    expect(getKafkaBrokers(config as never)).toEqual([
      "kafka-1:9092",
      "kafka-2:9092",
    ]);
    expect(readOrderId({ id: 7 })).toBe(7);
    expect(() => readOrderId({ id: 0 })).toThrow(
      "Invalid inventory.order.deleted event",
    );
    await expect(retry(operation, 2)).resolves.toBe("done");
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
