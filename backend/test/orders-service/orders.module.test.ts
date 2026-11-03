import { MODULE_METADATA } from "@nestjs/common/constants";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";
import { AppModule } from "../../orders-service/src/app.module";
import { DatabaseModule } from "../../orders-service/src/database/database.module";
import { getKafkaBrokers } from "../../orders-service/src/helpers/kafka";
import { CreateOrderDto } from "../../orders-service/src/orders/dto/create-order.dto";
import { OrdersModule } from "../../orders-service/src/orders/orders.module";

describe("orders-service modules", () => {
  it("declares metadata for all Nest modules", () => {
    for (const module of [AppModule, DatabaseModule, OrdersModule]) {
      const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module);
      const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module);
      const controllers = Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        module,
      );

      expect(imports ?? providers ?? controllers).toBeDefined();
    }
  });

  it("validates DTO data and Kafka brokers", async () => {
    const dto = Object.assign(new CreateOrderDto(), { title: "" });
    const config = { get: () => "kafka-1:9092, kafka-2:9092 " };

    await expect(validate(dto)).resolves.not.toHaveLength(0);
    expect(getKafkaBrokers(config as never)).toEqual([
      "kafka-1:9092",
      "kafka-2:9092",
    ]);
    expect(() => getKafkaBrokers({ get: () => "" } as never)).toThrow(
      "KAFKA_BROKERS is required",
    );
  });
});
