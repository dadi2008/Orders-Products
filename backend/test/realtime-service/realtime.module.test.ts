import { MODULE_METADATA } from "@nestjs/common/constants";
import { describe, expect, it } from "vitest";
import { AppModule } from "../../realtime-service/src/app.module";
import { PresenceModule } from "../../realtime-service/src/presence/presence.module";

describe("realtime-service modules", () => {
  it("declares metadata for all Nest modules", () => {
    for (const module of [AppModule, PresenceModule]) {
      const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module);
      const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module);
      const controllers = Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        module,
      );

      expect(imports ?? providers ?? controllers).toBeDefined();
    }
  });
});
